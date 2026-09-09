import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { IsDecimalString } from '../../common/validators/is-decimal-string.validator.js';

/**
 * Nenhuma regra `@ValidateIf` de campo condicional (RF06) é aplicada aqui de
 * propósito: a solicitação permanece em DRAFT durante toda a Fase 2 (não
 * existe endpoint de submissão ainda) e um formulário em etapas precisa
 * poder salvar rascunhos legitimamente incompletos. A validação cruzada
 * "hectares obrigatório quando landAcquisition=true" é responsabilidade da
 * transição de submissão da Fase 3.
 */
export class CreateCreditRequestDto {
  @IsString()
  clientId!: string;

  @IsDecimalString()
  requestedCreditLimit!: string;

  @IsBoolean()
  leasedAreaPlanting!: boolean;

  @IsOptional()
  @IsDecimalString()
  leasedAreaPlantingHectares?: string;

  @IsBoolean()
  firstHarvestAreaPlanting!: boolean;

  @IsBoolean()
  barterModality!: boolean;

  @IsBoolean()
  hasRenegotiatedDebts!: boolean;

  @IsBoolean()
  landAcquisition!: boolean;

  @IsOptional()
  @IsDecimalString()
  landAcquisitionHectares?: string;

  @IsOptional()
  @IsInt()
  landAcquisitionYear?: number;

  @IsOptional()
  @IsString()
  landAcquisitionLocation?: string;

  @IsOptional()
  @IsInt()
  landAcquisitionInstallments?: number;

  @IsBoolean()
  newMachineryAcquisition!: boolean;

  @IsOptional()
  @IsString()
  newMachineryDescription?: string;

  @IsBoolean()
  otherActivity!: boolean;

  @IsOptional()
  @IsString()
  otherActivityDescription?: string;
}
