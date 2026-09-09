import { IsString, MinLength } from 'class-validator';
import { TransitionDto } from './transition-base.dto.js';

export class RejectCreditRequestDto extends TransitionDto {
  @IsString()
  @MinLength(1)
  reason!: string;
}
