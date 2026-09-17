import type { PropertyFormValues } from '../../schemas/property.schema'
import type { CreatePropertyInput, Property } from '../../types/property'

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

export function toUpdatePropertyInput(
  values: PropertyFormValues,
): Omit<CreatePropertyInput, 'clientId'> {
  return {
    name: values.name,
    stateRegistration: values.stateRegistration || undefined,
    city: values.city,
    state: values.state,
    region: values.region,
    latitude: values.latitude || undefined,
    longitude: values.longitude || undefined,
    ownAreaHectares: values.ownAreaHectares,
    leasedAreaHectares: values.leasedAreaHectares,
    irrigatedAreaHectares: values.irrigatedAreaHectares,
  }
}

export function toPropertyFormValues(property: Property): PropertyFormValues {
  return {
    name: property.name,
    stateRegistration: property.stateRegistration ?? '',
    city: property.city,
    state: property.state,
    region: property.region,
    latitude: property.latitude ?? '',
    longitude: property.longitude ?? '',
    ownAreaHectares: property.ownAreaHectares,
    leasedAreaHectares: property.leasedAreaHectares,
    irrigatedAreaHectares: property.irrigatedAreaHectares,
  }
}
