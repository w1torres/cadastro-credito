import { IsEmail, IsString } from 'class-validator';
import { IsCpfOrCnpj } from '../../common/validators/is-cpf-or-cnpj.validator.js';

export class CreatePartnerDto {
  @IsString()
  name!: string;

  @IsCpfOrCnpj()
  document!: string;

  @IsString()
  phone!: string;

  @IsEmail()
  email!: string;

  @IsString()
  address!: string;
}
