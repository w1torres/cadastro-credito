import type { Client, CreateClientInput } from '../../types/client'
import type { CreatePartnerInput, Partner } from '../../types/partner'
import type { Property } from '../../types/property'
import type { CreateProductionInput, Production } from '../../types/production'
import type { CreditRequest } from '../../types/credit-request'
import type { EditClientRequestFormValues } from '../../schemas/edit-client-request.schema'
import { toCreditRequestFormValues } from '../credit-requests/mapCreditRequestForm'

function toClientFormValues(client: Client): CreateClientInput {
  return {
    name: client.name,
    document: client.document,
    spouseName: client.spouseName ?? '',
    phone: client.phone,
    email: client.email,
    address: client.address,
    city: client.city,
    state: client.state,
    zipCode: client.zipCode,
    relevantInfo: client.relevantInfo ?? '',
    hasEasyRegistrationInfo: client.hasEasyRegistrationInfo,
    timeInBusiness: client.timeInBusiness,
    hasCommercialReference: client.hasCommercialReference,
    commercialReferenceNotes: client.commercialReferenceNotes ?? '',
  }
}

function toPartnerFormValues(
  partner: Partner,
): CreatePartnerInput & { id: string } {
  return {
    id: partner.id,
    name: partner.name,
    document: partner.document,
    phone: partner.phone,
    email: partner.email,
    address: partner.address,
  }
}

function toProductionFormValues(
  production: Production,
): CreateProductionInput & { id: string } {
  return {
    id: production.id,
    harvestYear: production.harvestYear,
    cropName: production.cropName,
    hectares: production.hectares,
  }
}

export function toEditClientRequestFormValues(
  client: Client,
  properties: Property[],
  creditRequest: CreditRequest,
): EditClientRequestFormValues {
  return {
    client: toClientFormValues(client),
    partners: (client.partners ?? []).map(toPartnerFormValues),
    properties: properties.map((property) => ({
      id: property.id,
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
      productions: (property.productions ?? []).map(toProductionFormValues),
    })),
    creditRequest: toCreditRequestFormValues(creditRequest),
  }
}
