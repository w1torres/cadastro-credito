import { api } from '../../lib/apiClient'
import type { Branch } from '../../types/branch'

export const branchesApi = {
  list: () => api.get<Branch[]>('/branches'),
}
