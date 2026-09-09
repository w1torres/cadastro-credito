import { IsOptional, IsString } from 'class-validator';
import { TransitionDto } from './transition-base.dto.js';

export class CancelCreditRequestDto extends TransitionDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
