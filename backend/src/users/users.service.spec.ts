import { Test } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { Mock, vi } from 'vitest';
import { UsersService } from './users.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

type AnyMock = Mock<(...args: any[]) => any>;

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    user: {
      findUnique: AnyMock;
      create: AnyMock;
      findMany: AnyMock;
      count: AnyMock;
      update: AnyMock;
    };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        update: vi.fn(),
      },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get(UsersService);
  });

  describe('create', () => {
    it('hashes the password before persisting and selects only safe fields', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      // A Prisma `select` real projection would already omit passwordHash;
      // the mock returns a value shaped the same way to assert on it below.
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        name: 'Fulano',
        email: 'fulano@example.com',
        role: 'CONSULTOR',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create({
        name: 'Fulano',
        email: 'fulano@example.com',
        password: 'Senha@123',
        role: 'CONSULTOR',
      });

      expect(result).not.toHaveProperty('passwordHash');
      const createCall = prisma.user.create.mock.calls[0][0] as {
        data: { passwordHash: string };
        select: Record<string, boolean>;
      };
      expect(createCall.data.passwordHash).not.toBe('Senha@123');
      expect(createCall.select.passwordHash).toBeUndefined();
    });

    it('rejects when the e-mail is already taken', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing-user' });

      await expect(
        service.create({
          name: 'Fulano',
          email: 'fulano@example.com',
          password: 'Senha@123',
          role: 'CONSULTOR',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('findAll', () => {
    it('returns a paginated result', async () => {
      prisma.user.findMany.mockResolvedValue([{ id: 'user-1' }]);
      prisma.user.count.mockResolvedValue(1);

      const result = await service.findAll(1, 20);

      expect(result).toEqual({
        data: [{ id: 'user-1' }],
        meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
      });
    });
  });
});
