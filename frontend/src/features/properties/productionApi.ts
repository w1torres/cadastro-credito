import { api } from '../../lib/apiClient'
import type { CreateProductionInput, Production } from '../../types/production'

export const productionApi = {
  create: (propertyId: string, input: CreateProductionInput) =>
    api.post<Production>(`/properties/${propertyId}/production`, input),
}
