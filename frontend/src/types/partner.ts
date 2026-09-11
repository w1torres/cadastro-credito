export interface Partner {
  id: string
  clientId: string
  name: string
  document: string
  phone: string
  email: string
  address: string
  createdAt: string
  updatedAt: string
}

export interface CreatePartnerInput {
  name: string
  document: string
  phone: string
  email: string
  address: string
}
