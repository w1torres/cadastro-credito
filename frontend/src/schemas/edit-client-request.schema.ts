import { z } from 'zod'
import { clientSchema } from './client.schema'
import { partnerSchema } from './partner.schema'
import { propertySchema } from './property.schema'
import { productionSchema } from './production.schema'
import { creditRequestSchema } from './credit-request.schema'

/**
 * Mesma forma de `newClientRequestSchema`, mas com `id` opcional em cada
 * sub-registro (sócio/fazenda/cultura) para permitir editar um cadastro já
 * existente: presença de `id` decide PATCH vs. POST, ausência em relação à
 * lista original decide DELETE.
 */
const editPartnerSchema = partnerSchema.extend({ id: z.string().optional() })
const editProductionSchema = productionSchema.extend({
  id: z.string().optional(),
})
const editPropertySchema = propertySchema.extend({
  id: z.string().optional(),
  productions: z.array(editProductionSchema),
})

export const editClientRequestSchema = z.object({
  client: clientSchema,
  partners: z.array(editPartnerSchema),
  properties: z
    .array(editPropertySchema)
    .min(1, 'Cadastre ao menos uma propriedade'),
  creditRequest: creditRequestSchema,
})

export type EditClientRequestFormValues = z.infer<
  typeof editClientRequestSchema
>
