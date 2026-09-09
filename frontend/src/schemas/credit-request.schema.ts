import { z } from 'zod'
import { decimalString } from './decimal'

const optionalDecimal = z.union([decimalString(), z.literal('')]).optional()
/** Mantidos como texto (não `number`) para evitar o problema de NaN em campos vazios; convertidos ao montar o payload. */
const optionalDigits = z.union([z.string().regex(/^\d+$/, 'Informe apenas números'), z.literal('')]).optional()

export const creditRequestSchema = z.object({
  requestedCreditLimit: decimalString(),
  leasedAreaPlanting: z.boolean(),
  leasedAreaPlantingHectares: optionalDecimal,
  firstHarvestAreaPlanting: z.boolean(),
  barterModality: z.boolean(),
  hasRenegotiatedDebts: z.boolean(),
  landAcquisition: z.boolean(),
  landAcquisitionHectares: optionalDecimal,
  landAcquisitionYear: optionalDigits,
  landAcquisitionLocation: z.string().trim().optional().or(z.literal('')),
  landAcquisitionInstallments: optionalDigits,
  newMachineryAcquisition: z.boolean(),
  newMachineryDescription: z.string().trim().optional().or(z.literal('')),
  otherActivity: z.boolean(),
  otherActivityDescription: z.string().trim().optional().or(z.literal('')),
})

export type CreditRequestFormValues = z.infer<typeof creditRequestSchema>
