import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { CreditRequestStatus } from '@prisma/client';
import { TransitionDto } from './transition-base.dto.js';

/**
 * `targetStatus` só é obrigatório quando a etapa atual tem mais de um destino
 * de devolução possível (hoje, apenas CREDIT_REVIEW: CRÉDITO pode devolver ao
 * GERENTE ou pular direto para o CONSULTOR — decisão confirmada com o
 * usuário). `WorkflowService` valida essa obrigatoriedade condicional.
 */
export class ReturnCreditRequestDto extends TransitionDto {
  @IsString()
  @MinLength(1)
  reason!: string;

  @IsOptional()
  @IsEnum(CreditRequestStatus)
  targetStatus?: CreditRequestStatus;
}
