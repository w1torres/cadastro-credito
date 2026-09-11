import { z } from 'zod'
import { isCpfOrCnpj } from './client.schema'

export const partnerSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome do sócio'),
  document: z
    .string()
    .trim()
    .refine(
      isCpfOrCnpj,
      'Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido',
    ),
  phone: z.string().trim().min(8, 'Informe um telefone válido'),
  email: z.string().trim().email('Informe um e-mail válido'),
  address: z.string().trim().min(1, 'Campo obrigatório'),
})

export type PartnerFormValues = z.infer<typeof partnerSchema>
