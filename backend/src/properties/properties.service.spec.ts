import { Test } from '@nestjs/testing';
import { Mock, vi } from 'vitest';
import { PropertiesService } from './properties.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ClientsService } from '../clients/clients.service.js';
import type { AuthUser } from '../auth/types/auth-user.type.js';

type AnyMock = Mock<(...args: any[]) => any>;

const consultor: AuthUser = {
  id: 'consultor-1',
  name: 'Consultor',
  email: 'consultor@example.com',
  role: 'CONSULTOR',
};

describe('PropertiesService', () => {
  let service: PropertiesService;
  let prisma: {
    property: {
      create: AnyMock;
      findUnique: AnyMock;
      update: AnyMock;
      findMany: AnyMock;
      count: AnyMock;
    };
  };
  let clientsService: {
    findOneForUser: AnyMock;
    assertEditable: AnyMock;
    assertVisible: AnyMock;
  };

  beforeEach(async () => {
    prisma = {
      property: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
    };
    clientsService = {
      findOneForUser: vi
        .fn()
        .mockResolvedValue({ id: 'client-1', consultantId: consultor.id }),
      assertEditable: vi.fn(),
      assertVisible: vi.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        PropertiesService,
        { provide: PrismaService, useValue: prisma },
        { provide: ClientsService, useValue: clientsService },
      ],
    }).compile();

    service = moduleRef.get(PropertiesService);
  });

  it('creates a property under the validated parent client', async () => {
    prisma.property.create.mockResolvedValue({ id: 'property-1' });

    await service.create(
      {
        clientId: 'client-1',
        name: 'Fazenda Boa Vista',
        city: 'Cidade',
        state: 'RS',
        region: 'Norte',
        ownAreaHectares: '100.00',
        leasedAreaHectares: '0.00',
        irrigatedAreaHectares: '0.00',
      },
      consultor,
    );

    expect(clientsService.findOneForUser).toHaveBeenCalledWith(
      'client-1',
      consultor,
    );
    expect(clientsService.assertEditable).toHaveBeenCalled();
    const createCall = prisma.property.create.mock.calls[0][0] as {
      data: Record<string, unknown>;
    };
    expect(createCall.data.clientId).toBe('client-1');
  });

  it('round-trips a Decimal hectares value as a string, without float drift', async () => {
    prisma.property.findUnique.mockResolvedValue({
      id: 'property-1',
      client: { id: 'client-1', consultantId: consultor.id },
    });
    prisma.property.update.mockImplementation(
      ({ data }: { data: Record<string, unknown> }) =>
        Promise.resolve({ id: 'property-1', ...data }),
    );

    const updated = await service.update(
      'property-1',
      { ownAreaHectares: '123.45' },
      consultor,
    );

    expect(updated.ownAreaHectares).toBe('123.45');
  });

  describe('findAll', () => {
    it('filters by clientId when provided', async () => {
      prisma.property.findMany.mockResolvedValue([]);
      prisma.property.count.mockResolvedValue(0);

      await service.findAll(consultor, 1, 20, 'client-1');

      const findManyCall = prisma.property.findMany.mock.calls[0][0] as {
        where: Record<string, unknown>;
      };
      expect(findManyCall.where).toEqual({
        client: { consultantId: consultor.id },
        clientId: 'client-1',
      });
    });
  });
});
