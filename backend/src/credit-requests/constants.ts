import { DocumentType } from '@prisma/client';

/**
 * Checklist de documentos que o GERENTE/CREDITO pode marcar como pendentes.
 * Mesmos 9 itens do checklist da Fase 5. AUTORIZACAO_SPC_BACEN (termo de
 * assinatura, Fase 6) e OUTROS (anexos avulsos) ficam de fora.
 */
export const DOCUMENT_CHECKLIST_TYPES: DocumentType[] = [
  DocumentType.IMPOSTO_RENDA,
  DocumentType.DOCUMENTACAO_PESSOAL,
  DocumentType.COMPROVANTE_ENDERECO,
  DocumentType.CONTRATO_SOCIAL,
  DocumentType.CERTIDAO_ONUS_FAZENDA,
  DocumentType.CONTRATO_ARRENDAMENTO,
  DocumentType.DRE,
  DocumentType.CAR,
  DocumentType.DOCUMENTACAO_SOCIOS,
];
