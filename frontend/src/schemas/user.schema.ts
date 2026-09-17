import { z } from 'zod'
import { ROLES } from '../types/role'

export const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome completo'),
  email: z.string().trim().email('Informe um e-mail válido'),
  password: z.string().min(8, 'A senha deve ter ao menos 8 caracteres'),
  role: z.enum(ROLES),
  branchId: z.string().optional().or(z.literal('')),
})
export type CreateUserFormValues = z.infer<typeof createUserSchema>

export const updateUserSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome completo'),
  email: z.string().trim().email('Informe um e-mail válido'),
  role: z.enum(ROLES),
  isActive: z.boolean(),
  branchId: z.string().optional().or(z.literal('')),
})
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>
