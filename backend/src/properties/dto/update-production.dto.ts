import { PartialType } from '@nestjs/mapped-types';
import { CreateProductionDto } from './create-production.dto.js';

export class UpdateProductionDto extends PartialType(CreateProductionDto) {}
