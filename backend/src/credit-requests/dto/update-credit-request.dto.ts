import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateCreditRequestDto } from './create-credit-request.dto.js';

/**
 * `clientId` é imutável após a criação. `status` não faz parte deste DTO:
 * nesta fase toda solicitação nasce e permanece DRAFT — transições de
 * status são escopo exclusivo do workflow da Fase 3.
 */
export class UpdateCreditRequestDto extends PartialType(
  OmitType(CreateCreditRequestDto, ['clientId'] as const),
) {}
