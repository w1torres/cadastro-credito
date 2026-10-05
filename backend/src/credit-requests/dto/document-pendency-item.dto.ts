import { IsEnum, IsIn } from 'class-validator';
import { DocumentPendencyMotivo, DocumentType } from '@prisma/client';
import { DOCUMENT_CHECKLIST_TYPES } from '../constants.js';

/** Um documento marcado na devolução: faltante (não anexado) ou errado (anexado incorretamente). */
export class DocumentPendencyItemDto {
  @IsIn(DOCUMENT_CHECKLIST_TYPES as DocumentType[])
  type!: DocumentType;

  @IsEnum(DocumentPendencyMotivo)
  motivo!: DocumentPendencyMotivo;
}
