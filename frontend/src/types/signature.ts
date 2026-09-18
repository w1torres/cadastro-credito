export const SIGNATURE_STATUSES = [
  'PENDING',
  'SENT',
  'VIEWED',
  'SIGNED',
  'DECLINED',
  'EXPIRED',
  'CANCELLED',
] as const
export type SignatureStatus = (typeof SIGNATURE_STATUSES)[number]

export interface SignatureRequest {
  id: string
  creditRequestId: string
  status: SignatureStatus
  requestedById: string
  signedAt: string | null
  createdAt: string
  updatedAt: string
}
