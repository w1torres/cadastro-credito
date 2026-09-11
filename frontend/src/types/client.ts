import type { TimeInBusiness } from './time-in-business'
import type { Partner } from './partner'

export interface Client {
  id: string
  name: string
  document: string
  spouseName: string | null
  phone: string
  email: string
  address: string
  city: string
  state: string
  zipCode: string
  relevantInfo: string | null
  hasEasyRegistrationInfo: boolean
  timeInBusiness: TimeInBusiness
  hasCommercialReference: boolean
  commercialReferenceNotes: string | null
  consultantId: string
  createdAt: string
  updatedAt: string
  partners?: Partner[]
}

export interface CreateClientInput {
  name: string
  document: string
  spouseName?: string
  phone: string
  email: string
  address: string
  city: string
  state: string
  zipCode: string
  relevantInfo?: string
  hasEasyRegistrationInfo: boolean
  timeInBusiness: TimeInBusiness
  hasCommercialReference: boolean
  commercialReferenceNotes?: string
}
