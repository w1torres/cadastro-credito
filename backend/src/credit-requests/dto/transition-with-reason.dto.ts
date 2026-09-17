import { IsOptional, IsString } from 'class-validator';
import { TransitionDto } from './transition-base.dto.js';

/** Usado por transições onde a observação/parecer é opcional (submit, approve). */
export class TransitionWithReasonDto extends TransitionDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
