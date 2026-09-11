import { z } from 'zod'
import { decimalString } from './decimal'

export const productionSchema = z.object({
  harvestYear: z.string().trim().min(1, 'Informe a safra'),
  cropName: z.string().trim().min(1, 'Informe a cultura'),
  hectares: decimalString(),
})

export type ProductionFormValues = z.infer<typeof productionSchema>
