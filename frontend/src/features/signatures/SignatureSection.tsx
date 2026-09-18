import { useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Download, Paperclip, Trash2 } from 'lucide-react'
import { signaturesApi } from './signaturesApi'
import { documentsApi } from '../documents/documentsApi'
import type { SignatureStatus } from '../../types/signature'
import {
  SIGNATURE_STATUS_LABELS,
  SIGNATURE_STATUS_VARIANT,
} from '../../lib/labels'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { useToast } from '../../components/ui/Toast'
import { ApiError } from '../../lib/apiClient'

const RETRYABLE_STATUSES: SignatureStatus[] = [
  'DECLINED',
  'EXPIRED',
  'CANCELLED',
]
const OPEN_STATUSES: SignatureStatus[] = ['PENDING', 'SENT', 'VIEWED']

export function SignatureSection({
  creditRequestId,
  canRequest,
}: {
  creditRequestId: string
  canRequest: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useToast()

  function onError(error: unknown) {
    showError(
      error instanceof ApiError
        ? error.message
        : 'Não foi possível concluir a operação.',
    )
  }

  const { data: documents, isLoading: isLoadingDocuments } = useQuery({
    queryKey: ['documents', creditRequestId],
    queryFn: () => documentsApi.list(creditRequestId),
  })
  const authorizationDocument = documents?.find(
    (document) => document.type === 'AUTORIZACAO_SPC_BACEN',
  )

  const { data: signatureRequest, isLoading: isLoadingSignature } = useQuery({
    queryKey: ['signature', creditRequestId],
    queryFn: () => signaturesApi.getStatus(creditRequestId),
    // Enquanto a assinatura está em aberto, consulta periodicamente o status
    // (atualizado pelo webhook da Clicksign no backend) sem exigir reload manual.
    refetchInterval: (query) =>
      query.state.data && OPEN_STATUSES.includes(query.state.data.status)
        ? 5000
        : false,
  })

  const uploadMutation = useMutation({
    mutationFn: (file: File) =>
      documentsApi.upload(creditRequestId, file, 'AUTORIZACAO_SPC_BACEN'),
    onSuccess: () =>
      void queryClient.invalidateQueries({
        queryKey: ['documents', creditRequestId],
      }),
    onError,
  })
  const removeMutation = useMutation({
    mutationFn: (documentId: string) => documentsApi.remove(documentId),
    onSuccess: () =>
      void queryClient.invalidateQueries({
        queryKey: ['documents', creditRequestId],
      }),
    onError,
  })
  const requestMutation = useMutation({
    mutationFn: () => signaturesApi.request(creditRequestId),
    onSuccess: () => {
      showSuccess('Autorização enviada para assinatura do cliente.')
      void queryClient.invalidateQueries({
        queryKey: ['signature', creditRequestId],
      })
    },
    onError,
  })

  if (isLoadingDocuments || isLoadingSignature) return <Spinner />

  const canSendNew =
    canRequest &&
    !!authorizationDocument &&
    (!signatureRequest || RETRYABLE_STATUSES.includes(signatureRequest.status))
  // Uma vez enviado pro Clicksign (qualquer status além dos "reenviáveis"),
  // o documento não pode mais ser trocado/removido por baixo do envelope já criado.
  const canEditDocument =
    canRequest &&
    (!signatureRequest || RETRYABLE_STATUSES.includes(signatureRequest.status))

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-600">
        Anexe o termo de autorização de consulta ao SPC/Bacen para que o cliente
        possa ler e assinar eletronicamente. É obrigatório antes de enviar a
        solicitação para o gerente.
      </p>

      <div className="rounded-lg border border-slate-200 p-4">
        <p className="mb-2 font-semibold text-slate-800">
          Termo de Autorização de Consulta SPC/Bacen
        </p>

        {authorizationDocument ? (
          <div className="flex items-center justify-between gap-2 rounded-md bg-slate-50 px-2 py-1.5 text-sm">
            <span className="truncate text-slate-700">
              {authorizationDocument.originalName}
            </span>
            <span className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                className="rounded p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                onClick={() =>
                  void documentsApi.download(authorizationDocument)
                }
                aria-label={`Baixar ${authorizationDocument.originalName}`}
              >
                <Download className="size-4" aria-hidden="true" />
              </button>
              {canEditDocument && (
                <button
                  type="button"
                  className="rounded p-1 text-slate-500 hover:bg-red-100 hover:text-red-600"
                  onClick={() =>
                    removeMutation.mutate(authorizationDocument.id)
                  }
                  aria-label={`Remover ${authorizationDocument.originalName}`}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              )}
            </span>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Nenhum documento anexado ainda.
          </p>
        )}

        {canEditDocument && (
          <>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) uploadMutation.mutate(file)
                e.target.value = ''
              }}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mt-3"
              isLoading={uploadMutation.isPending}
              onClick={() => inputRef.current?.click()}
            >
              <Paperclip className="size-4" aria-hidden="true" />
              {authorizationDocument ? 'Substituir arquivo' : 'Anexar arquivo'}
            </Button>
          </>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {signatureRequest ? (
          <div className="flex items-center gap-2">
            <Badge variant={SIGNATURE_STATUS_VARIANT[signatureRequest.status]}>
              {SIGNATURE_STATUS_LABELS[signatureRequest.status]}
            </Badge>
            {signatureRequest.signedAt && (
              <span className="text-xs text-slate-500">
                em {new Date(signatureRequest.signedAt).toLocaleString('pt-BR')}
              </span>
            )}
          </div>
        ) : (
          <Badge>Nenhuma solicitação de assinatura ainda</Badge>
        )}

        {canRequest && !authorizationDocument && (
          <p className="text-xs text-amber-700">
            Anexe o termo acima para poder enviar para assinatura.
          </p>
        )}

        {canSendNew && (
          <Button
            type="button"
            size="sm"
            className="w-fit"
            isLoading={requestMutation.isPending}
            onClick={() => requestMutation.mutate()}
          >
            Enviar para assinatura
          </Button>
        )}
      </div>
    </div>
  )
}
