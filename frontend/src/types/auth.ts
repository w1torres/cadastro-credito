import type { Role } from './role'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: Role
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface Session extends AuthTokens {
  user: AuthUser
}
