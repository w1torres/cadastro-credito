import { z } from 'zod'
import { TIME_IN_BUSINESS_OPTIONS } from '../types/time-in-business'

/** Espelha `backend/src/common/validators/is-cpf-or-cnpj.validator.ts`: distingue PF/PJ só pela quantidade de dígitos. */
function isCpfOrCnpj(value: string): boolean {
  const digits = value.replace(/\D/g, '')
  return digits.length === 11 || digits.length === 14
}

export const clientSchema = z
  .object({
    name: z.string().trim().min(2, 'Informe o nome completo'),
    document: z
      .string()
      .trim()
      .refine(isCpfOrCnpj, 'Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido'),
    spouseName: z.string().trim().optional().or(z.literal('')),
    phone: z.string().trim().min(8, 'Informe um telefone válido'),
    email: z.string().trim().email('Informe um e-mail válido'),
    address: z.string().trim().min(1, 'Campo obrigatório'),
    city: z.string().trim().min(1, 'Campo obrigatório'),
    state: z.string().trim().length(2, 'Use a sigla do estado (ex.: RS)'),
    zipCode: z.string().trim().min(8, 'Informe um CEP válido'),
    relevantInfo: z.string().trim().optional().or(z.literal('')),
    hasEasyRegistrationInfo: z.boolean(),
    timeInBusiness: z.enum(TIME_IN_BUSINESS_OPTIONS),
    hasCommercialReference: z.boolean(),
    commercialReferenceNotes: z.string().trim().optional().or(z.literal('')),
  })
  .refine((data) => !data.hasCommercialReference || Boolean(data.commercialReferenceNotes), {
    message: 'Descreva a referência comercial',
    path: ['commercialReferenceNotes'],
  })

export type ClientFormValues = z.infer<typeof clientSchema>
