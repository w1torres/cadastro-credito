import { api } from '../../lib/apiClient'
import type { AuthUser, Session } from '../../types/auth'

export const authApi = {
  login: (email: string, password: string) =>
    api.post<Session>('/auth/login', { email, password }, { skipAuth: true }),
  me: () => api.get<AuthUser>('/auth/me'),
}
