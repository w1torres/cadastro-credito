import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateUserDto } from './create-user.dto.js';

/** Perfil, filial, nome e e-mail. Não há senha no sistema (login só pelo Entra ID). */
export class UpdateUserDto extends PartialType(CreateUserDto) {
  /** Desativar bloqueia login e invalida o token na próxima requisição (ver JwtStrategy). */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
