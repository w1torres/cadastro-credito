import { api } from '../../lib/apiClient'
import type { AdminUser, CreateUserInput, UpdateUserInput } from '../../types/user'
import type { PaginatedResult } from '../../types/pagination'

export const usersApi = {
  list: (page = 1, pageSize = 50) =>
    api.get<PaginatedResult<AdminUser>>(`/users?page=${page}&pageSize=${pageSize}`),
  get: (id: string) => api.get<AdminUser>(`/users/${id}`),
  create: (input: CreateUserInput) => api.post<AdminUser>('/users', input),
  update: (id: string, input: UpdateUserInput) =>
    api.patch<AdminUser>(`/users/${id}`, input),
}
