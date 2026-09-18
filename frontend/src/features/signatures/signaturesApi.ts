import { api } from '../../lib/apiClient'
import type { SignatureRequest } from '../../types/signature'

export const signaturesApi = {
  request: (creditRequestId: string) =>
    api.post<SignatureRequest>(
      `/credit-requests/${creditRequestId}/request-signature`,
    ),
  getStatus: (creditRequestId: string) =>
    api.get<SignatureRequest | null>(
      `/credit-requests/${creditRequestId}/signature`,
    ),
}
