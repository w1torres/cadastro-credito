import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { TimeInBusiness } from '@prisma/client';
import { IsCpfOrCnpj } from '../../common/validators/is-cpf-or-cnpj.validator.js';

export class CreateClientDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsCpfOrCnpj()
  document!: string;

  @IsOptional()
  @IsString()
  spouseName?: string;

  @IsString()
  phone!: string;

  @IsEmail()
  email!: string;

  @IsString()
  address!: string;

  @IsString()
  city!: string;

  @IsString()
  state!: string;

  @IsString()
  zipCode!: string;

  @IsOptional()
  @IsString()
  relevantInfo?: string;

  @IsBoolean()
  hasEasyRegistrationInfo!: boolean;

  @IsEnum(TimeInBusiness)
  timeInBusiness!: TimeInBusiness;

  @IsBoolean()
  hasCommercialReference!: boolean;

  @ValidateIf((client: CreateClientDto) => client.hasCommercialReference)
  @IsString()
  @MinLength(1)
  commercialReferenceNotes?: string;
}
