import { IsString, MinLength } from 'class-validator';

export class EntraLoginDto {
  /** Id token obtido pelo MSAL no frontend. */
  @IsString()
  @MinLength(10)
  idToken!: string;
}
