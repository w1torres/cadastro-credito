import { useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Download, Paperclip, Trash2 } from 'lucide-react'
import { documentsApi } from './documentsApi'
import { DOCUMENT_TYPES } from '../../types/document'
import type { CreditRequestDocument, DocumentType } from '../../types/document'
import { DOCUMENT_TYPE_LABELS } from '../../lib/labels'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { useToast } from '../../components/ui/Toast'
import { ApiError } from '../../lib/apiClient'

// AUTORIZACAO_SPC_BACEN não entra neste checklist — é o documento específico
// da etapa de Assinatura (o cliente lê e assina via Clicksign), gerenciado
// pelo SignatureSection, não um anexo de apoio à análise.
const CHECKLIST_TYPES = DOCUMENT_TYPES.filter(
  (type) => type !== 'OUTROS' && type !== 'AUTORIZACAO_SPC_BACEN',
)

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function DocumentsSection({
  creditRequestId,
  canEdit,
}: {
  creditRequestId: string
  canEdit: boolean
}) {
  const queryClient = useQueryClient()
  const { showError } = useToast()

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents', creditRequestId],
    queryFn: () => documentsApi.list(creditRequestId),
  })

  function onError(error: unknown) {
    showError(
      error instanceof ApiError
        ? error.message
        : 'Não foi possível concluir a operação.',
    )
  }

  const uploadMutation = useMutation({
    mutationFn: ({ file, type }: { file: File; type: DocumentType }) =>
      documentsApi.upload(creditRequestId, file, type),
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

  if (isLoading) return <Spinner />

  const byType = new Map<DocumentType, CreditRequestDocument[]>()
  for (const document of documents ?? []) {
    byType.set(document.type, [...(byType.get(document.type) ?? []), document])
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Documentos</h3>
          <span className="text-xs text-slate-500">
            {canEdit
              ? 'Anexe o arquivo de cada documento disponível.'
              : 'Documentos anexados pelo consultor.'}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {CHECKLIST_TYPES.map((type) => (
            <DocumentTypeCard
              key={type}
              type={type}
              documents={byType.get(type) ?? []}
              canEdit={canEdit}
              isUploading={uploadMutation.isPending}
              onUpload={(file) => uploadMutation.mutate({ file, type })}
              onRemove={(id) => removeMutation.mutate(id)}
            />
          ))}
        </div>
      </div>

      <OutrosDocumentos
        documents={byType.get('OUTROS') ?? []}
        canEdit={canEdit}
        isUploading={uploadMutation.isPending}
        onUpload={(file) => uploadMutation.mutate({ file, type: 'OUTROS' })}
        onRemove={(id) => removeMutation.mutate(id)}
      />
    </div>
  )
}

function DocumentTypeCard({
  type,
  documents,
  canEdit,
  isUploading,
  onUpload,
  onRemove,
}: {
  type: DocumentType
  documents: CreditRequestDocument[]
  canEdit: boolean
  isUploading: boolean
  onUpload: (file: File) => void
  onRemove: (documentId: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <p className="font-semibold text-slate-800">
        {DOCUMENT_TYPE_LABELS[type]}
      </p>

      {documents.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1">
          {documents.map((document) => (
            <DocumentRow
              key={document.id}
              document={document}
              canEdit={canEdit}
              onRemove={onRemove}
            />
          ))}
        </ul>
      )}

      {canEdit && (
        <>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onUpload(file)
              e.target.value = ''
            }}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mt-3"
            isLoading={isUploading}
            onClick={() => inputRef.current?.click()}
          >
            <Paperclip className="size-4" aria-hidden="true" />
            {documents.length > 0 ? 'Anexar outro arquivo' : 'Anexar arquivo'}
          </Button>
        </>
      )}
    </div>
  )
}

function DocumentRow({
  document,
  canEdit,
  onRemove,
}: {
  document: CreditRequestDocument
  canEdit: boolean
  onRemove: (documentId: string) => void
}) {
  return (
    <li className="flex items-center justify-between gap-2 rounded-md bg-slate-50 px-2 py-1.5 text-sm">
      <span className="truncate text-slate-700">
        {document.originalName}{' '}
        <span className="text-slate-400">
          ({formatFileSize(document.size)})
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          className="rounded p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
          onClick={() => void documentsApi.download(document)}
          aria-label={`Baixar ${document.originalName}`}
        >
          <Download className="size-4" aria-hidden="true" />
        </button>
        {canEdit && (
          <button
            type="button"
            className="rounded p-1 text-slate-500 hover:bg-red-100 hover:text-red-600"
            onClick={() => onRemove(document.id)}
            aria-label={`Remover ${document.originalName}`}
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        )}
      </span>
    </li>
  )
}

function OutrosDocumentos({
  documents,
  canEdit,
  isUploading,
  onUpload,
  onRemove,
}: {
  documents: CreditRequestDocument[]
  canEdit: boolean
  isUploading: boolean
  onUpload: (file: File) => void
  onRemove: (documentId: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div>
      <p className="mb-2 font-semibold text-slate-800">
        {DOCUMENT_TYPE_LABELS.OUTROS}
      </p>
      {documents.length > 0 && (
        <ul className="mb-3 flex flex-col gap-1">
          {documents.map((document) => (
            <DocumentRow
              key={document.id}
              document={document}
              canEdit={canEdit}
              onRemove={onRemove}
            />
          ))}
        </ul>
      )}
      {canEdit && (
        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-slate-300 p-5 text-center">
          <Paperclip className="size-6 text-slate-400" aria-hidden="true" />
          <p className="text-sm text-slate-500">
            Adicione documentos que não estejam no checklist acima.
          </p>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onUpload(file)
              e.target.value = ''
            }}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            isLoading={isUploading}
            onClick={() => inputRef.current?.click()}
          >
            Selecionar arquivo
          </Button>
        </div>
      )}
    </div>
  )
}
