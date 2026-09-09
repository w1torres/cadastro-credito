import { z } from 'zod'
import { CREDIT_REQUEST_STATUSES } from '../types/credit-request-status'

export const returnSchema = z.object({
  reason: z.string().trim().min(1, 'Informe o motivo da devolução'),
  targetStatus: z.enum(CREDIT_REQUEST_STATUSES).optional(),
})
export type ReturnFormValues = z.infer<typeof returnSchema>

export const rejectSchema = z.object({
  reason: z.string().trim().min(1, 'Informe o motivo da reprovação'),
})
export type RejectFormValues = z.infer<typeof rejectSchema>

export const cancelSchema = z.object({
  reason: z.string().trim().optional().or(z.literal('')),
})
export type CancelFormValues = z.infer<typeof cancelSchema>
