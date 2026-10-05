import { api } from '../../lib/apiClient'
import type {
  CreateCreditRequestInput,
  CreditRequest,
  CreditRequestHistoryEntry,
} from '../../types/credit-request'
import type { CreditRequestStatus } from '../../types/credit-request-status'
import type { PaginatedResult } from '../../types/pagination'
import type { DocumentType } from '../../types/document'
import type { FichaCadastralSituacao } from '../../types/credit-request'

export interface ListCreditRequestsParams {
  clientId?: string
  status?: CreditRequestStatus
  page?: number
  pageSize?: number
}

interface TransitionPayload {
  expectedUpdatedAt: string
}

interface ReturnPayload extends TransitionPayload {
  reason: string
  targetStatus?: CreditRequestStatus
  pendencias?: { type: DocumentType; motivo: 'FALTANTE' | 'ERRADO' }[]
}

interface ReasonPayload extends TransitionPayload {
  reason: string
}

interface OptionalReasonPayload extends TransitionPayload {
  reason?: string
}

function buildQuery(params: ListCreditRequestsParams): string {
  const search = new URLSearchParams()
  if (params.clientId) search.set('clientId', params.clientId)
  if (params.status) search.set('status', params.status)
  search.set('page', String(params.page ?? 1))
  search.set('pageSize', String(params.pageSize ?? 100))
  return search.toString()
}

export const creditRequestsApi = {
  list: (params: ListCreditRequestsParams = {}) =>
    api.get<PaginatedResult<CreditRequest>>(
      `/credit-requests?${buildQuery(params)}`,
    ),
  get: (id: string) => api.get<CreditRequest>(`/credit-requests/${id}`),
  create: (input: CreateCreditRequestInput) =>
    api.post<CreditRequest>('/credit-requests', input),
  update: (id: string, input: Partial<CreateCreditRequestInput>) =>
    api.patch<CreditRequest>(`/credit-requests/${id}`, input),
  setDocumentPendencies: (id: string, types: DocumentType[]) =>
    api.patch<DocumentType[]>(`/credit-requests/${id}/document-pendencies`, {
      types,
    }),
  setFichaCadastral: (
    id: string,
    payload: { situacao: FichaCadastralSituacao; motivo?: string },
  ) =>
    api.patch<CreditRequest>(`/credit-requests/${id}/ficha-cadastral`, payload),
  history: (id: string) =>
    api.get<CreditRequestHistoryEntry[]>(`/credit-requests/${id}/history`),
  submit: (id: string, payload: OptionalReasonPayload) =>
    api.post<CreditRequest>(`/credit-requests/${id}/submit`, payload),
  return: (id: string, payload: ReturnPayload) =>
    api.post<CreditRequest>(`/credit-requests/${id}/return`, payload),
  approve: (id: string, payload: OptionalReasonPayload) =>
    api.post<CreditRequest>(`/credit-requests/${id}/approve`, payload),
  reject: (id: string, payload: ReasonPayload) =>
    api.post<CreditRequest>(`/credit-requests/${id}/reject`, payload),
  cancel: (id: string, payload: OptionalReasonPayload) =>
    api.post<CreditRequest>(`/credit-requests/${id}/cancel`, payload),
}
