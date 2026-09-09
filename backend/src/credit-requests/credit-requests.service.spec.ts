import { Test } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { Mock, vi } from 'vitest';
import { CreditRequestsService } from './credit-requests.service.js';
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

describe('CreditRequestsService', () => {
  let service: CreditRequestsService;
  let prisma: {
    creditRequest: {
      create: AnyMock;
      findUnique: AnyMock;
      update: AnyMock;
      delete: AnyMock;
    };
    creditRequestHistory: { create: AnyMock };
    auditLog: { create: AnyMock };
    $transaction: AnyMock;
  };
  let clientsService: {
    findOneForUser: AnyMock;
    assertEditable: AnyMock;
  };

  beforeEach(async () => {
    prisma = {
      creditRequest: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      creditRequestHistory: { create: vi.fn() },
      auditLog: { create: vi.fn() },
      $transaction: vi.fn(),
    };
    prisma.$transaction.mockImplementation(
      (callback: (tx: typeof prisma) => unknown) => callback(prisma),
    );

    clientsService = {
      findOneForUser: vi
        .fn()
        .mockResolvedValue({ id: 'client-1', consultantId: consultor.id }),
      assertEditable: vi.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        CreditRequestsService,
        { provide: PrismaService, useValue: prisma },
        { provide: ClientsService, useValue: clientsService },
      ],
    }).compile();

    service = moduleRef.get(CreditRequestsService);
  });

  describe('create', () => {
    it('always defaults a new credit request to DRAFT and records history + audit', async () => {
      prisma.creditRequest.create.mockResolvedValue({
        id: 'cr-1',
        status: 'DRAFT',
      });

      await service.create(
        { clientId: 'client-1', requestedCreditLimit: '1000.00' } as never,
        consultor,
      );

      const createCall = prisma.creditRequest.create.mock.calls[0][0] as {
        data: Record<string, unknown>;
      };
      expect(createCall.data.status).toBe('DRAFT');
      expect(createCall.data.consultantId).toBe(consultor.id);
      expect(prisma.creditRequestHistory.create).toHaveBeenCalledWith({
        data: {
          creditRequestId: 'cr-1',
          fromStatus: null,
          toStatus: 'DRAFT',
          actorId: consultor.id,
        },
      });
      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          userId: consultor.id,
          action: 'CREDIT_REQUEST_CREATED',
          entity: 'CreditRequest',
          entityId: 'cr-1',
        },
      });
    });
  });

  describe('update', () => {
    it('allows editing a DRAFT credit request', async () => {
      prisma.creditRequest.findUnique.mockResolvedValue({
        id: 'cr-1',
        consultantId: consultor.id,
        status: 'DRAFT',
      });
      prisma.creditRequest.update.mockResolvedValue({ id: 'cr-1' });

      await service.update(
        'cr-1',
        { requestedCreditLimit: '2000.00' },
        consultor,
      );

      expect(prisma.creditRequest.update).toHaveBeenCalled();
    });

    it('allows editing a RETURNED_TO_CONSULTANT credit request', async () => {
      prisma.creditRequest.findUnique.mockResolvedValue({
        id: 'cr-1',
        consultantId: consultor.id,
        status: 'RETURNED_TO_CONSULTANT',
      });
      prisma.creditRequest.update.mockResolvedValue({ id: 'cr-1' });

      await service.update(
        'cr-1',
        { requestedCreditLimit: '2000.00' },
        consultor,
      );

      expect(prisma.creditRequest.update).toHaveBeenCalled();
    });

    it('rejects editing a credit request that is already under review', async () => {
      prisma.creditRequest.findUnique.mockResolvedValue({
        id: 'cr-1',
        consultantId: consultor.id,
        status: 'MANAGER_REVIEW',
      });

      await expect(
        service.update('cr-1', { requestedCreditLimit: '2000.00' }, consultor),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('remove', () => {
    it('deletes a DRAFT credit request', async () => {
      prisma.creditRequest.findUnique.mockResolvedValue({
        id: 'cr-1',
        consultantId: consultor.id,
        status: 'DRAFT',
      });

      await service.remove('cr-1', consultor);

      expect(prisma.creditRequest.delete).toHaveBeenCalledWith({
        where: { id: 'cr-1' },
      });
    });

    it('rejects deleting a credit request that is no longer a DRAFT', async () => {
      prisma.creditRequest.findUnique.mockResolvedValue({
        id: 'cr-1',
        consultantId: consultor.id,
        status: 'SUBMITTED_TO_MANAGER',
      });

      await expect(service.remove('cr-1', consultor)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });
  });
});
