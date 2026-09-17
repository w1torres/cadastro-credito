import { api } from '../../lib/apiClient'
import type { CreateProductionInput, Production } from '../../types/production'

export const productionApi = {
  create: (propertyId: string, input: CreateProductionInput) =>
    api.post<Production>(`/properties/${propertyId}/production`, input),
  update: (id: string, input: Partial<CreateProductionInput>) =>
    api.patch<Production>(`/production/${id}`, input),
  remove: (id: string) => api.delete<void>(`/production/${id}`),
}
