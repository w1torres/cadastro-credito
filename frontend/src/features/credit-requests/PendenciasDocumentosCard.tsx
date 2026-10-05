import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { creditRequestsApi } from './creditRequestsApi'
import { ApiError } from '../../lib/apiClient'
import { useToast } from '../../components/ui/Toast'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { DOCUMENT_TYPE_LABELS } from '../../lib/labels'
import { PENDENCY_MOTIVO_LABELS } from '../../lib/document-checklist'
import { ChecklistAnalise } from '../documents/ChecklistAnalise'
import type { DocumentType } from '../../types/document'
import type {
  CreditRequest,
  FichaCadastralSituacao,
} from '../../types/credit-request'

const FICHA_LABELS: Record<FichaCadastralSituacao, string> = {
  EM_ANALISE: 'Em análise',
  APROVADA: 'Aprovada',
  REPROVADA: 'Reprovada',
}

/**
 * Visão do CONSULTOR: no lugar do status do workflow, mostra só o que falta
 * (documentos pendentes) e a situação da ficha cadastral.
 */
export function PendenciasConsultorCard({
  creditRequest,
}: {
  creditRequest: CreditRequest
}) {
  const pendencias = creditRequest.documentPendencies ?? []
  const situacao = creditRequest.fichaCadastralSituacao

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pendências da solicitação</CardTitle>
      </CardHeader>

      <div className="flex flex-col gap-4 text-sm">
        {pendencias.length > 0 && (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
            Há documentos pendentes nesta solicitação. Anexe ou corrija os itens
            abaixo na etapa de documentos e reenvie a solicitação.
          </p>
        )}
        <div>
          <p className="text-slate-500">Documentos pendentes</p>
          {pendencias.length === 0 ? (
            <p className="text-slate-900">Nenhum documento pendente.</p>
          ) : (
            <ul className="mt-1 list-disc pl-5 text-slate-900">
              {pendencias.map((item) => (
                <li key={item.type}>
                  {DOCUMENT_TYPE_LABELS[item.type]} —{' '}
                  {PENDENCY_MOTIVO_LABELS[item.motivo]}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="text-slate-500">Ficha cadastral</p>
          <p className="text-slate-900">{FICHA_LABELS[situacao]}</p>
          {situacao === 'REPROVADA' && creditRequest.fichaCadastralMotivo && (
            <p className="mt-1 text-slate-600">
              Motivo: {creditRequest.fichaCadastralMotivo}
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}

/**
 * Visão do GERENTE (na análise dele) e do CREDITO (na análise de crédito):
 * marca os documentos pendentes e define a situação da ficha cadastral.
 */
export function RevisaoDocumentosCard({
  creditRequest,
}: {
  creditRequest: CreditRequest
}) {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useToast()

  const pendenciasAtuais = (creditRequest.documentPendencies ?? []).map(
    (item) => item.type,
  )
  const [pendencias, setPendencias] = useState<DocumentType[]>(pendenciasAtuais)
  const [situacao, setSituacao] = useState<FichaCadastralSituacao>(
    creditRequest.fichaCadastralSituacao,
  )
  const [motivo, setMotivo] = useState(creditRequest.fichaCadastralMotivo ?? '')

  const mudouPendencias =
    pendencias.length !== pendenciasAtuais.length ||
    pendencias.some((tipo) => !pendenciasAtuais.includes(tipo))
  const mudouFicha =
    situacao !== creditRequest.fichaCadastralSituacao ||
    (situacao === 'REPROVADA' &&
      motivo.trim() !== (creditRequest.fichaCadastralMotivo ?? '').trim())

  const salvarMutation = useMutation({
    mutationFn: async () => {
      if (mudouPendencias) {
        await creditRequestsApi.setDocumentPendencies(
          creditRequest.id,
          pendencias,
        )
      }
      if (mudouFicha) {
        await creditRequestsApi.setFichaCadastral(creditRequest.id, {
          situacao,
          motivo: situacao === 'REPROVADA' ? motivo.trim() : undefined,
        })
      }
    },
    onSuccess: () => {
      showSuccess('Revisão salva.')
      void queryClient.invalidateQueries({
        queryKey: ['credit-request', creditRequest.id],
      })
    },
    onError: (error: unknown) => {
      showError(
        error instanceof ApiError
          ? error.message
          : 'Não foi possível salvar a revisão.',
      )
    },
  })

  function alternarPendencia(tipo: DocumentType) {
    setPendencias((atual) =>
      atual.includes(tipo)
        ? atual.filter((item) => item !== tipo)
        : [...atual, tipo],
    )
  }

  const motivoInvalido = situacao === 'REPROVADA' && motivo.trim().length === 0
  const podeSalvar = (mudouPendencias || mudouFicha) && !motivoInvalido

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revisão de documentos e ficha cadastral</CardTitle>
      </CardHeader>

      <div className="flex flex-col gap-6 text-sm">
        <div>
          <p className="mb-2 font-medium text-slate-800">
            Documentos para análise
          </p>
          <ChecklistAnalise
            creditRequestId={creditRequest.id}
            marcados={Object.fromEntries(
              pendencias.map((tipo) => [tipo, 'FALTANTE']),
            )}
            onAlternar={alternarPendencia}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            className="font-medium text-slate-800"
            htmlFor="ficha-situacao"
          >
            Ficha cadastral
          </label>
          <select
            id="ficha-situacao"
            value={situacao}
            onChange={(e) =>
              setSituacao(e.target.value as FichaCadastralSituacao)
            }
            className="rounded-md border border-slate-300 bg-white px-3 py-2"
          >
            {(Object.keys(FICHA_LABELS) as FichaCadastralSituacao[]).map(
              (valor) => (
                <option key={valor} value={valor}>
                  {FICHA_LABELS[valor]}
                </option>
              ),
            )}
          </select>
          {situacao === 'REPROVADA' && (
            <>
              <label className="text-slate-700" htmlFor="ficha-motivo">
                Motivo da reprovação
              </label>
              <textarea
                id="ficha-motivo"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                maxLength={500}
                rows={3}
                className="rounded-md border border-slate-300 px-3 py-2"
              />
              {motivoInvalido && (
                <p className="text-xs text-red-600">
                  Informe o motivo da reprovação.
                </p>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            disabled={!podeSalvar}
            isLoading={salvarMutation.isPending}
            onClick={() => salvarMutation.mutate()}
          >
            Salvar revisão
          </Button>
        </div>
      </div>
    </Card>
  )
}
