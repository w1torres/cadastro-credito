import type { DocumentType } from '../types/document'

/** Os 9 documentos do checklist que podem ser marcados como pendentes ou errados (ver constants.ts no backend). */
export const DOCUMENT_CHECKLIST: DocumentType[] = [
  'IMPOSTO_RENDA',
  'DOCUMENTACAO_PESSOAL',
  'COMPROVANTE_ENDERECO',
  'CONTRATO_SOCIAL',
  'CERTIDAO_ONUS_FAZENDA',
  'CONTRATO_ARRENDAMENTO',
  'DRE',
  'CAR',
  'DOCUMENTACAO_SOCIOS',
]

/** FALTANTE: o documento não foi anexado. ERRADO: anexado, mas incorreto. */
export type DocumentPendencyMotivo = 'FALTANTE' | 'ERRADO'

export const PENDENCY_MOTIVO_LABELS: Record<DocumentPendencyMotivo, string> = {
  FALTANTE: 'Faltante',
  ERRADO: 'Errado',
}
