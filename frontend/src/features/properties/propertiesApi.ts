import { api } from '../../lib/apiClient'
import type { CreatePropertyInput, Property } from '../../types/property'
import type { PaginatedResult } from '../../types/pagination'

export const propertiesApi = {
  listByClient: (clientId: string) =>
    api.get<PaginatedResult<Property>>(`/properties?clientId=${clientId}&pageSize=100`),
  create: (input: CreatePropertyInput) => api.post<Property>('/properties', input),
}
