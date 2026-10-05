import { api } from '../../lib/apiClient'
import type { AuthUser, Session } from '../../types/auth'

export interface DevUser {
  id: string
  name: string
  email: string
  role: string
  branch: string | null
}

export const authApi = {
  devUsers: () => api.get<DevUser[]>('/auth/dev-users', { skipAuth: true }),
  devLogin: (email: string) =>
    api.post<Session>('/auth/dev-login', { email }, { skipAuth: true }),
  loginEntra: (idToken: string) =>
    api.post<Session>('/auth/entra', { idToken }, { skipAuth: true }),
  me: () => api.get<AuthUser>('/auth/me'),
}
