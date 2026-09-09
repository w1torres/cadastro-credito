import { Test } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { Mock, vi } from 'vitest';
import { ClientsService } from './clients.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AuthUser } from '../auth/types/auth-user.type.js';

type AnyMock = Mock<(...args: any[]) => any>;

const consultor: AuthUser = {
  id: 'consultor-1',
  name: 'Consultor',
  email: 'consultor@example.com',
  role: 'CONSULTOR',
};
const gerente: AuthUser = {
  id: 'gerente-1',
  name: 'Gerente',
  email: 'gerente@example.com',
  role: 'GERENTE',
};

describe('ClientsService', () => {
  let service: ClientsService;
  let prisma: {
    client: {
      findUnique: AnyMock;
      create: AnyMock;
      findMany: AnyMock;
      count: AnyMock;
    };
  };

  beforeEach(async () => {
    prisma = {
      client: {
        findUnique: vi.fn(),
        create: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [ClientsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get(ClientsService);
  });

  describe('create', () => {
    it('scopes the new client to the calling consultant', async () => {
      prisma.client.findUnique.mockResolvedValue(null);
      prisma.client.create.mockImplementation(
        ({ data }: { data: Record<string, unknown> }) =>
          Promise.resolve({ id: 'client-1', ...data }),
      );

      await service.create({ document: '12345678900' } as never, consultor);

      const createCall = prisma.client.create.mock.calls[0][0] as {
        data: { consultantId: string };
      };
      expect(createCall.data.consultantId).toBe(consultor.id);
    });
  });

  describe('findAll', () => {
    it('filters by consultantId for a CONSULTOR', async () => {
      prisma.client.findMany.mockResolvedValue([]);
      prisma.client.count.mockResolvedValue(0);

      await service.findAll(consultor, 1, 20);

      const findManyCall = prisma.client.findMany.mock.calls[0][0] as {
        where: Record<string, unknown>;
      };
      expect(findManyCall.where).toEqual({ consultantId: consultor.id });
    });

    it('does not filter for a GERENTE', async () => {
      prisma.client.findMany.mockResolvedValue([]);
      prisma.client.count.mockResolvedValue(0);

      await service.findAll(gerente, 1, 20);

      const findManyCall = prisma.client.findMany.mock.calls[0][0] as {
        where: Record<string, unknown>;
      };
      expect(findManyCall.where).toEqual({});
    });
  });

  describe('assertVisible', () => {
    it('denies a CONSULTOR access to another consultant client', () => {
      expect(() =>
        service.assertVisible({ consultantId: 'someone-else' }, consultor),
      ).toThrow(ForbiddenException);
    });

    it('allows a GERENTE to view any client', () => {
      expect(() =>
        service.assertVisible({ consultantId: 'someone-else' }, gerente),
      ).not.toThrow();
    });
  });
});
