import { ArrayUnique, IsArray, IsIn } from 'class-validator';
import { DocumentType } from '@prisma/client';
import { DOCUMENT_CHECKLIST_TYPES } from '../constants.js';

export class SetDocumentPendenciesDto {
  /** Lista completa dos documentos pendentes (substitui a anterior). Lista vazia = nenhuma pendência. */
  @IsArray()
  @ArrayUnique()
  @IsIn(DOCUMENT_CHECKLIST_TYPES as DocumentType[], { each: true })
  types!: DocumentType[];
}
