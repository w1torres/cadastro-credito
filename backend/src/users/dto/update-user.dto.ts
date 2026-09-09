import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto.js';

/**
 * Reset de senha esta fora do escopo da Fase 2 (nao existe servico de
 * e-mail); a troca de senha do proprio usuario fica para uma fase futura.
 */
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const),
) {}
