import { z } from 'zod'
import { decimalString } from './decimal'

export const propertySchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome da propriedade'),
  stateRegistration: z.string().trim().optional().or(z.literal('')),
  city: z.string().trim().min(1, 'Campo obrigatório'),
  state: z.string().trim().length(2, 'Use a sigla do estado (ex.: RS)'),
  region: z.string().trim().min(1, 'Campo obrigatório'),
  latitude: z.union([decimalString({ allowNegative: true, maxDecimals: 6 }), z.literal('')]).optional(),
  longitude: z.union([decimalString({ allowNegative: true, maxDecimals: 6 }), z.literal('')]).optional(),
  ownAreaHectares: decimalString(),
  leasedAreaHectares: decimalString(),
  irrigatedAreaHectares: decimalString(),
})

export type PropertyFormValues = z.infer<typeof propertySchema>
