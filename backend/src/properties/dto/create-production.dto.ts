import { IsString } from 'class-validator';
import { IsDecimalString } from '../../common/validators/is-decimal-string.validator.js';

export class CreateProductionDto {
  @IsString()
  harvestYear!: string;

  @IsString()
  cropName!: string;

  @IsDecimalString()
  hectares!: string;
}
