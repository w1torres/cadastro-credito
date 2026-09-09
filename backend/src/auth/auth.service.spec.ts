import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { vi } from 'vitest';
import { AuthService } from './auth.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findUnique: ReturnType<typeof vi.fn> } };

  beforeEach(async () => {
    prisma = { user: { findUnique: vi.fn() } };

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

  describe('validateCredentials', () => {
    it('returns the auth user when the password matches', async () => {
      const passwordHash = await bcrypt.hash('Senha@123', 4);
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        name: 'Fulano',
        email: 'fulano@example.com',
        role: 'CONSULTOR',
        isActive: true,
        passwordHash,
      });

      const result = await service.validateCredentials(
        'fulano@example.com',
        'Senha@123',
      );

      expect(result).toEqual({
        id: 'user-1',
        name: 'Fulano',
        email: 'fulano@example.com',
        role: 'CONSULTOR',
      });
    });

    it('rejects when the password does not match', async () => {
      const passwordHash = await bcrypt.hash('Senha@123', 4);
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        name: 'Fulano',
        email: 'fulano@example.com',
        role: 'CONSULTOR',
        isActive: true,
        passwordHash,
      });

      await expect(
        service.validateCredentials('fulano@example.com', 'senha-errada'),
      ).rejects.toThrow('Credenciais inválidas.');
    });

    it('rejects when the user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.validateCredentials('ninguem@example.com', 'Senha@123'),
      ).rejects.toThrow('Credenciais inválidas.');
    });

    it('rejects when the user is inactive', async () => {
      const passwordHash = await bcrypt.hash('Senha@123', 4);
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        name: 'Fulano',
        email: 'fulano@example.com',
        role: 'CONSULTOR',
        isActive: false,
        passwordHash,
      });

      await expect(
        service.validateCredentials('fulano@example.com', 'Senha@123'),
      ).rejects.toThrow('Credenciais inválidas.');
    });
  });

  describe('login', () => {
    it('issues an access and refresh token pair', async () => {
      const tokens = await service.login({
        id: 'user-1',
        name: 'Fulano',
        email: 'fulano@example.com',
        role: 'CONSULTOR',
      });

      expect(tokens).toEqual({
        accessToken: 'signed-token',
        refreshToken: 'signed-token',
      });
    });
  });
});
