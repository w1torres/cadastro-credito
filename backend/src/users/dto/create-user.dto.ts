import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsEnum(Role)
  role!: Role;

  /** Obrigatória na prática para CONSULTOR/GERENTE; CREDITO/ADMIN não têm filial. */
  @IsOptional()
  @IsString()
  branchId?: string;

  /** Código do vendedor/gerente no SAP (ex.: RC0202). Opcional. */
  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z]{2}\d{4}$/, { message: 'Código deve ter 2 letras e 4 números (ex.: RC0202)' })
  codigo?: string;
}
