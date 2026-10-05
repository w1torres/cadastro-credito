import { useQuery } from '@tanstack/react-query'
import { documentsApi } from './documentsApi'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../components/ui/Toast'
import { ApiError } from '../../lib/apiClient'
import { DOCUMENT_TYPE_LABELS } from '../../lib/labels'
import {
  DOCUMENT_CHECKLIST,
  PENDENCY_MOTIVO_LABELS,
  type DocumentPendencyMotivo,
} from '../../lib/document-checklist'
import type { DocumentType } from '../../types/document'

export type MarcacoesPendencia = Partial<
  Record<DocumentType, DocumentPendencyMotivo>
>

interface ChecklistAnaliseProps {
  creditRequestId: string
  /** Documentos marcados como pendentes (ou errados, quando há motivo). */
  marcados: MarcacoesPendencia
  onAlternar: (tipo: DocumentType) => void
  /** Presente quando a tela permite escolher faltante/errado (devolução). */
  onMotivo?: (tipo: DocumentType, motivo: DocumentPendencyMotivo) => void
}

/**
 * Lista os 9 documentos do checklist com os arquivos já anexados, para o analista
 * abrir cada um antes de marcar pendência.
 */
export function ChecklistAnalise({
  creditRequestId,
  marcados,
  onAlternar,
  onMotivo,
}: ChecklistAnaliseProps) {
  const { showError } = useToast()
  const {
    data: documentos,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['documents', creditRequestId],
    queryFn: () => documentsApi.list(creditRequestId),
  })

  async function baixar(
    documento: Parameters<typeof documentsApi.download>[0],
  ) {
    try {
      await documentsApi.download(documento)
    } catch (error) {
      showError(
        error instanceof ApiError
          ? error.message
          : 'Não foi possível baixar o documento.',
      )
    }
  }

  if (isLoading)
    return <p className="text-sm text-slate-500">Carregando documentos…</p>
  if (isError) {
    return (
      <p className="text-sm text-red-700">
        Não foi possível carregar os documentos.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {DOCUMENT_CHECKLIST.map((tipo) => {
        const anexos = (documentos ?? []).filter(
          (documento) => documento.type === tipo,
        )
        const marcado = marcados[tipo]
        return (
          <div key={tipo} className="rounded-md border border-slate-200 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="flex items-center gap-2 font-medium text-slate-800">
                <input
                  type="checkbox"
                  checked={Boolean(marcado)}
                  onChange={() => onAlternar(tipo)}
                  className="size-4"
                />
                {DOCUMENT_TYPE_LABELS[tipo]}
              </label>
              {anexos.length === 0 ? (
                <Badge variant="warning">Não anexado</Badge>
              ) : (
                <Badge variant="success">
                  {anexos.length} {anexos.length === 1 ? 'arquivo' : 'arquivos'}
                </Badge>
              )}
            </div>

            {anexos.length > 0 && (
              <ul className="mt-2 flex flex-col gap-1">
                {anexos.map((documento) => (
                  <li
                    key={documento.id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="truncate text-slate-700">
                      {documento.originalName}
                    </span>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => void baixar(documento)}
                    >
                      Abrir
                    </Button>
                  </li>
                ))}
              </ul>
            )}

            {marcado && onMotivo && (
              <select
                aria-label={`Situação de ${DOCUMENT_TYPE_LABELS[tipo]}`}
                value={marcado}
                onChange={(e) =>
                  onMotivo(tipo, e.target.value as DocumentPendencyMotivo)
                }
                className="mt-2 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
              >
                {(
                  Object.keys(
                    PENDENCY_MOTIVO_LABELS,
                  ) as DocumentPendencyMotivo[]
                ).map((valor) => (
                  <option key={valor} value={valor}>
                    {PENDENCY_MOTIVO_LABELS[valor]}
                  </option>
                ))}
              </select>
            )}
          </div>
        )
      })}
    </div>
  )
}
