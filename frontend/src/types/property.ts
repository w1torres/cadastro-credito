import type { Production } from './production'

export interface Property {
  id: string
  clientId: string
  name: string
  stateRegistration: string | null
  city: string
  state: string
  region: string
  latitude: string | null
  longitude: string | null
  ownAreaHectares: string
  leasedAreaHectares: string
  irrigatedAreaHectares: string
  createdAt: string
  updatedAt: string
  productions?: Production[]
}

export interface CreatePropertyInput {
  clientId: string
  name: string
  stateRegistration?: string
  city: string
  state: string
  region: string
  latitude?: string
  longitude?: string
  ownAreaHectares: string
  leasedAreaHectares: string
  irrigatedAreaHectares: string
}
