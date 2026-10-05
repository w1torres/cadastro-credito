import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { verifyEntraIdToken, type EntraIdClaims } from './entra-token.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AuthUser } from './types/auth-user.type.js';
import type { JwtPayload } from './types/jwt-payload.type.js';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Login exclusivo por Entra ID: valida o id token do Microsoft e localiza o
   * usuário pelo e-mail. Quem não foi cadastrado pelo administrador não entra.
   */
  async validateEntraToken(idToken: string): Promise<AuthUser> {
    const tenantId = this.configService.getOrThrow<string>('ENTRA_TENANT_ID');
    const clientId = this.configService.getOrThrow<string>('ENTRA_CLIENT_ID');

    let claims: EntraIdClaims;
    try {
      claims = await verifyEntraIdToken(idToken, tenantId, clientId);
    } catch {
      throw new UnauthorizedException('Token do Microsoft inválido ou expirado.');
    }

    const email = (claims.email ?? claims.preferred_username ?? '').trim().toLowerCase();
    if (!email) {
      throw new UnauthorizedException('Token do Microsoft sem e-mail.');
    }

    const user = await this.prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });
    if (!user) {
      throw new UnauthorizedException(
        'Usuário não cadastrado. Peça a um administrador para cadastrá-lo.',
      );
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Usuário inativo.');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      branchId: user.branchId,
    };
  }

  private devLoginHabilitado(): boolean {
    return (
      this.configService.get<string>('AUTH_DEV_LOGIN') === 'true' &&
      this.configService.get<string>('NODE_ENV') !== 'production'
    );
  }

  /** Usuários ativos para a tela de teste local (só com AUTH_DEV_LOGIN). */
  async listarUsuariosDeTeste(): Promise<
    Array<{ id: string; name: string; email: string; role: string; branch: string | null }>
  > {
    if (!this.devLoginHabilitado()) {
      throw new ForbiddenException('Login de desenvolvimento desativado.');
    }
    const usuarios = await this.prisma.user.findMany({
      where: {
        isActive: true,
        OR: [{ email: { endsWith: '@teste.local' } }, { email: { endsWith: '@example.com' } }],
      },
      select: { id: true, name: true, email: true, role: true, branch: { select: { name: true } } },
      orderBy: [{ name: 'asc' }],
    });
    // Um usuário por perfil: o Admin e um consultor, gerente e crédito de teste.
    const PERFIS_TESTE = ['ADMIN', 'CONSULTOR', 'GERENTE', 'CREDITO'];
    const escolhidos = PERFIS_TESTE.map((perfil) => usuarios.find((u) => u.role === perfil)).filter(
      (u): u is (typeof usuarios)[number] => Boolean(u),
    );
    return escolhidos.map((usuario) => ({
      id: usuario.id,
      name: usuario.name,
      email: usuario.email,
      role: usuario.role,
      branch: usuario.branch?.name ?? null,
    }));
  }

  /**
   * Login de desenvolvimento para testar com usuários locais (sem Entra ID).
   * Só funciona com AUTH_DEV_LOGIN=true e fora de produção.
   */
  async devLogin(email: string): Promise<{ user: AuthUser } & AuthTokens> {
    if (!this.devLoginHabilitado()) {
      throw new ForbiddenException('Login de desenvolvimento desativado.');
    }

    const user = await this.prisma.user.findFirst({
      where: { email: { equals: email.trim().toLowerCase(), mode: 'insensitive' } },
    });
    if (!user) {
      throw new UnauthorizedException('Usuário de teste não encontrado.');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Usuário inativo.');
    }

    const authUser: AuthUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      branchId: user.branchId,
    };
    return { user: authUser, ...(await this.issueTokens(user.id)) };
  }

  login(user: AuthUser): Promise<AuthTokens> {
    return this.issueTokens(user.id);
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido ou expirado.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuário inválido ou inativo.');
    }

    return this.issueTokens(user.id);
  }

  private async issueTokens(userId: string): Promise<AuthTokens> {
    const payload: JwtPayload = { sub: userId };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_ACCESS_EXPIRES_IN',
          '15m',
        ) as JwtSignOptions['expiresIn'],
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_EXPIRES_IN',
          '7d',
        ) as JwtSignOptions['expiresIn'],
      }),
    ]);
    return { accessToken, refreshToken };
  }
}
