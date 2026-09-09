import { IsISO8601 } from 'class-validator';

/**
 * `expectedUpdatedAt` implementa o mecanismo de concorrência da spec 04
 * ("usar updatedAt... para evitar sobrescrita silenciosa"): o cliente deve
 * enviar o `updatedAt` que tinha em mãos antes de disparar a transição.
 */
export class TransitionDto {
  @IsISO8601()
  expectedUpdatedAt!: string;
}
