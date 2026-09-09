import { IsOptional, IsString } from 'class-validator';
import { IsDecimalString } from '../../common/validators/is-decimal-string.validator.js';

export class CreatePropertyDto {
  @IsString()
  clientId!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  stateRegistration?: string;

  @IsString()
  city!: string;

  @IsString()
  state!: string;

  @IsString()
  region!: string;

  @IsOptional()
  @IsDecimalString({ allowNegative: true, maxDecimals: 6 })
  latitude?: string;

  @IsOptional()
  @IsDecimalString({ allowNegative: true, maxDecimals: 6 })
  longitude?: string;

  @IsDecimalString()
  ownAreaHectares!: string;

  @IsDecimalString()
  leasedAreaHectares!: string;

  @IsDecimalString()
  irrigatedAreaHectares!: string;
}
