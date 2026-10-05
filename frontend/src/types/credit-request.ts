import type { CreditRequestStatus } from './credit-request-status'
import type { DocumentType } from './document'

export type FichaCadastralSituacao = 'EM_ANALISE' | 'APROVADA' | 'REPROVADA'

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
  fichaCadastralSituacao: FichaCadastralSituacao
  fichaCadastralMotivo: string | null
  fichaCadastralRevisadaEm: string | null
  documentPendencies?: { type: DocumentType; motivo: 'FALTANTE' | 'ERRADO' }[]
  createdAt: string
  updatedAt: string
  consultant?: {
    id: string
    name: string
    branch: { id: string; name: string } | null
  }
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
