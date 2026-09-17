import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateUserDto } from './create-user.dto.js';

/**
 * Reset de senha esta fora do escopo da Fase 2 (nao existe servico de
 * e-mail); a troca de senha do proprio usuario fica para uma fase futura.
 */
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const),
) {
  /** Desativar bloqueia login e invalida o token na próxima requisição (ver JwtStrategy). */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
