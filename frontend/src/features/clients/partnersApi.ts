import { api } from '../../lib/apiClient'
import type { CreatePartnerInput, Partner } from '../../types/partner'

export const partnersApi = {
  create: (clientId: string, input: CreatePartnerInput) =>
    api.post<Partner>(`/clients/${clientId}/partners`, input),
  update: (id: string, input: Partial<CreatePartnerInput>) =>
    api.patch<Partner>(`/partners/${id}`, input),
  remove: (id: string) => api.delete<void>(`/partners/${id}`),
}
