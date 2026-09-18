export const DOCUMENT_TYPES = [
  'IMPOSTO_RENDA',
  'DOCUMENTACAO_PESSOAL',
  'COMPROVANTE_ENDERECO',
  'CONTRATO_SOCIAL',
  'CERTIDAO_ONUS_FAZENDA',
  'CONTRATO_ARRENDAMENTO',
  'DRE',
  'CAR',
  'DOCUMENTACAO_SOCIOS',
  'AUTORIZACAO_SPC_BACEN',
  'OUTROS',
] as const
export type DocumentType = (typeof DOCUMENT_TYPES)[number]

export interface CreditRequestDocument {
  id: string
  creditRequestId: string
  type: DocumentType
  originalName: string
  mimeType: string
  size: number
  uploadedById: string
  createdAt: string
  updatedAt: string
}
