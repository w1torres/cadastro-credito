import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreditRequestStatus } from '@prisma/client';
import { TransitionDto } from './transition-base.dto.js';
import { DocumentPendencyItemDto } from './document-pendency-item.dto.js';

/**
 * `targetStatus` só é obrigatório quando a etapa atual tem mais de um destino
 * de devolução possível. Hoje nenhuma etapa tem mais de um destino: o CRÉDITO
 * devolve sempre ao GERENTE da filial, e o GERENTE devolve ao CONSULTOR.
 *
 * `pendencias` (opcional) substitui a lista de documentos pendentes da
 * solicitação no mesmo momento da devolução: faltantes ou errados.
 */
export class ReturnCreditRequestDto extends TransitionDto {
  @IsString()
  @MinLength(1)
  reason!: string;

  @IsOptional()
  @IsEnum(CreditRequestStatus)
  targetStatus?: CreditRequestStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentPendencyItemDto)
  pendencias?: DocumentPendencyItemDto[];
}
