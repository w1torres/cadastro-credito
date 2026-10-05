import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthService, AuthTokens } from './auth.service.js';
import { EntraLoginDto } from './dto/entra-login.dto.js';
import { DevLoginDto } from './dto/dev-login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { Public } from './decorators/public.decorator.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import type { AuthUser } from './types/auth-user.type.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('entra')
  async loginEntra(
    @Body() dto: EntraLoginDto,
  ): Promise<AuthTokens & { user: AuthUser }> {
    const user = await this.authService.validateEntraToken(dto.idToken);
    const tokens = await this.authService.login(user);
    return { user, ...tokens };
  }

  @Public()
  @Get('dev-users')
  listarUsuariosDeTeste() {
    return this.authService.listarUsuariosDeTeste();
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('dev-login')
  async devLogin(
    @Body() dto: DevLoginDto,
  ): Promise<AuthTokens & { user: AuthUser }> {
    const { user, ...tokens } = await this.authService.devLogin(dto.email);
    return { user, ...tokens };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto): Promise<AuthTokens> {
    return this.authService.refresh(dto.refreshToken);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  logout(): void {
    // Sem revogacao server-side nesta fase: o cliente descarta os tokens.
    // Uma denylist de refresh tokens fica para a Fase 3+ caso necessario.
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser): AuthUser {
    return user;
  }
}
