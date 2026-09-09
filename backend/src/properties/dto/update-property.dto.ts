import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreatePropertyDto } from './create-property.dto.js';

/** clientId é imutável após a criação — a propriedade não muda de dono. */
export class UpdatePropertyDto extends PartialType(
  OmitType(CreatePropertyDto, ['clientId'] as const),
) {}
