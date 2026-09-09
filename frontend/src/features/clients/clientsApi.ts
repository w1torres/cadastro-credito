import { api } from '../../lib/apiClient'
import type { Client, CreateClientInput } from '../../types/client'
import type { PaginatedResult } from '../../types/pagination'

export const clientsApi = {
  list: (page = 1, pageSize = 20) => api.get<PaginatedResult<Client>>(`/clients?page=${page}&pageSize=${pageSize}`),
  get: (id: string) => api.get<Client>(`/clients/${id}`),
  create: (input: CreateClientInput) => api.post<Client>('/clients', input),
}
