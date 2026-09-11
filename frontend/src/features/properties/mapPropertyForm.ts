import type { PropertyFormValues } from '../../schemas/property.schema'
import type { CreatePropertyInput } from '../../types/property'

export function toCreatePropertyInput(
  values: PropertyFormValues,
  clientId: string,
): CreatePropertyInput {
  return {
    ...values,
    clientId,
    stateRegistration: values.stateRegistration || undefined,
    latitude: values.latitude || undefined,
    longitude: values.longitude || undefined,
  }
}
