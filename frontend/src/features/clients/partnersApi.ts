import { api } from '../../lib/apiClient'
import type { CreatePartnerInput, Partner } from '../../types/partner'

export const partnersApi = {
  create: (clientId: string, input: CreatePartnerInput) =>
    api.post<Partner>(`/clients/${clientId}/partners`, input),
}
