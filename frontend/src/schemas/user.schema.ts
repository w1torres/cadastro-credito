import { z } from 'zod'
import { ROLES } from '../types/role'

export const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome completo'),
  email: z.string().trim().email('Informe um e-mail válido'),
  role: z.enum(ROLES),
  branchId: z.string().optional().or(z.literal('')),
  codigo: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{2}\d{4}$/, 'Use 2 letras e 4 números (ex.: RC0202)')
    .optional()
    .or(z.literal('')),
})
export type CreateUserFormValues = z.infer<typeof createUserSchema>

export const updateUserSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome completo'),
  email: z.string().trim().email('Informe um e-mail válido'),
  role: z.enum(ROLES),
  isActive: z.boolean(),
  branchId: z.string().optional().or(z.literal('')),
  codigo: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{2}\d{4}$/, 'Use 2 letras e 4 números (ex.: RC0202)')
    .optional()
    .or(z.literal('')),
})
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>
