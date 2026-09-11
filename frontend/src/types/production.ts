export interface Production {
  id: string
  propertyId: string
  harvestYear: string
  cropName: string
  hectares: string
  createdAt: string
  updatedAt: string
}

export interface CreateProductionInput {
  harvestYear: string
  cropName: string
  hectares: string
}
