import type { CreditRequestStatus } from './credit-request-status'

export interface CreditRequest {
  id: string
  clientId: string
  consultantId: string
  requestedCreditLimit: string
  status: CreditRequestStatus
  leasedAreaPlanting: boolean
  leasedAreaPlantingHectares: string | null
  firstHarvestAreaPlanting: boolean
  barterModality: boolean
  hasRenegotiatedDebts: boolean
  landAcquisition: boolean
  landAcquisitionHectares: string | null
  landAcquisitionYear: number | null
  landAcquisitionLocation: string | null
  landAcquisitionInstallments: number | null
  newMachineryAcquisition: boolean
  newMachineryDescription: string | null
  otherActivity: boolean
  otherActivityDescription: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateCreditRequestInput {
  clientId: string
  requestedCreditLimit: string
  leasedAreaPlanting: boolean
  leasedAreaPlantingHectares?: string
  firstHarvestAreaPlanting: boolean
  barterModality: boolean
  hasRenegotiatedDebts: boolean
  landAcquisition: boolean
  landAcquisitionHectares?: string
  landAcquisitionYear?: number
  landAcquisitionLocation?: string
  landAcquisitionInstallments?: number
  newMachineryAcquisition: boolean
  newMachineryDescription?: string
  otherActivity: boolean
  otherActivityDescription?: string
}

export interface CreditRequestHistoryEntry {
  id: string
  creditRequestId: string
  fromStatus: CreditRequestStatus | null
  toStatus: CreditRequestStatus
  actorId: string
  reason: string | null
  createdAt: string
}
