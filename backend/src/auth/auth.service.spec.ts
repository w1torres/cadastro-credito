import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { vi } from 'vitest';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { verifyEntraIdToken } from './entra-token.js';
import { PrismaService } from '../prisma/prisma.service.js';

vi.mock('./entra-token.js', () => ({ verifyEntraIdToken: vi.fn() }));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findUnique: ReturnType<typeof vi.fn>; findFirst: ReturnType<typeof vi.fn> } };

  beforeEach(async () => {
    prisma = { user: { findUnique: vi.fn(), findFirst: vi.fn() } };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: JwtService,
          useValue: {
            signAsync: vi.fn().mockResolvedValue('signed-token'),
            verifyAsync: vi.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: (key: string) => `value-for-${key}`,
            get: (_key: string, fallback?: string) => fallback,
          },
        },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  describe('validateEntraToken', () => {
    const usuario = {
      id: 'user-1',
      name: 'Fulano',
      email: 'fulano@example.com',
      role: 'CONSULTOR',
      branchId: 'branch-1',
      isActive: true,
    };

    it('returns the auth user for a valid Microsoft token of a registered active user', async () => {
      vi.mocked(verifyEntraIdToken).mockResolvedValue({ email: 'Fulano@Example.com' });
      prisma.user.findFirst.mockResolvedValue(usuario);

      const result = await service.validateEntraToken('token-valido-123');

      expect(result).toEqual({
        id: 'user-1',
        name: 'Fulano',
        email: 'fulano@example.com',
        role: 'CONSULTOR',
        branchId: 'branch-1',
      });
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: { equals: 'fulano@example.com', mode: 'insensitive' } },
      });
    });

    it('falls back to preferred_username when email is missing from the claims', async () => {
      vi.mocked(verifyEntraIdToken).mockResolvedValue({ preferred_username: 'fulano@example.com' });
      prisma.user.findFirst.mockResolvedValue(usuario);

      await expect(service.validateEntraToken('token-valido-123')).resolves.toMatchObject({ id: 'user-1' });
    });

    it('rejects an invalid or expired Microsoft token', async () => {
      vi.mocked(verifyEntraIdToken).mockRejectedValue(new Error('signature invalid'));

      await expect(service.validateEntraToken('token-ruim-123')).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects a user who was not registered by the administrator', async () => {
      vi.mocked(verifyEntraIdToken).mockResolvedValue({ email: 'ninguem@example.com' });
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(service.validateEntraToken('token-valido-123')).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects an inactive user', async () => {
      vi.mocked(verifyEntraIdToken).mockResolvedValue({ email: 'fulano@example.com' });
      prisma.user.findFirst.mockResolvedValue({ ...usuario, isActive: false });

      await expect(service.validateEntraToken('token-valido-123')).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('devLogin', () => {
    it('rejects when AUTH_DEV_LOGIN is not enabled', async () => {
      const semFlag = await Test.createTestingModule({
        providers: [
          AuthService,
          { provide: PrismaService, useValue: prisma },
          { provide: JwtService, useValue: { signAsync: vi.fn(), verifyAsync: vi.fn() } },
          {
            provide: ConfigService,
            useValue: { getOrThrow: (key: string) => `value-for-${key}`, get: () => undefined },
          },
        ],
      }).compile();

      await expect(semFlag.get(AuthService).devLogin('fulano@example.com')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });

  describe('listarUsuariosDeTeste', () => {
    it('rejects when AUTH_DEV_LOGIN is not enabled', async () => {
      await expect(service.listarUsuariosDeTeste()).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('login', () => {
    it('issues an access and refresh token pair', async () => {
      const tokens = await service.login({
        id: 'user-1',
        name: 'Fulano',
        email: 'fulano@example.com',
        role: 'CONSULTOR',
        branchId: null,
      });

      expect(tokens).toEqual({
        accessToken: 'signed-token',
        refreshToken: 'signed-token',
      });
    });
  });
});
