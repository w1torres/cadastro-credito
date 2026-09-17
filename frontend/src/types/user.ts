import type { Role } from './role'

export interface AdminUser {
  id: string
  name: string
  email: string
  role: Role
  isActive: boolean
  branchId: string | null
  branch: { id: string; name: string } | null
  createdAt: string
  updatedAt: string
}

export interface CreateUserInput {
  name: string
  email: string
  password: string
  role: Role
  branchId?: string
}

export interface UpdateUserInput {
  name?: string
  email?: string
  role?: Role
  isActive?: boolean
  branchId?: string
}
