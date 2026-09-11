import { z } from 'zod'
import { clientSchema } from './client.schema'
import { partnerSchema } from './partner.schema'
import { propertySchema } from './property.schema'
import { productionSchema } from './production.schema'
import { creditRequestSchema } from './credit-request.schema'

export const propertyWithProductionsSchema = propertySchema.extend({
  productions: z.array(productionSchema),
})
export type PropertyWithProductionsFormValues = z.infer<
  typeof propertyWithProductionsSchema
>

export const newClientRequestSchema = z.object({
  client: clientSchema,
  partners: z.array(partnerSchema),
  properties: z
    .array(propertyWithProductionsSchema)
    .min(1, 'Cadastre ao menos uma propriedade'),
  creditRequest: creditRequestSchema,
})

export type NewClientRequestFormValues = z.infer<typeof newClientRequestSchema>
