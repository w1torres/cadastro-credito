import { FichaCadastralSituacao } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class SetFichaCadastralDto {
  @IsEnum(FichaCadastralSituacao)
  situacao!: FichaCadastralSituacao;

  /** Obrigatório quando a situação for REPROVADA (validado no serviço). */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivo?: string;
}
