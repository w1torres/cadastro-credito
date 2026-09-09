import { Test } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { Mock, vi } from 'vitest';
import { WorkflowService } from './workflow.service.js';
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
const credito: AuthUser = {
  id: 'credito-1',
  name: 'Credito',
  email: 'credito@example.com',
  role: 'CREDITO',
};
const admin: AuthUser = {
  id: 'admin-1',
  name: 'Admin',
  email: 'admin@example.com',
  role: 'ADMIN',
};

const UPDATED_AT = new Date('2026-01-01T00:00:00.000Z');

function baseCreditRequest(overrides: Record<string, unknown> = {}) {
  return {
    id: 'cr-1',
    clientId: 'client-1',
    consultantId: consultor.id,
    status: 'DRAFT',
    updatedAt: UPDATED_AT,
    ...overrides,
  };
}

describe('WorkflowService', () => {
  let service: WorkflowService;
  let prisma: {
    creditRequest: { findUnique: AnyMock; update: AnyMock };
    creditRequestHistory: { create: AnyMock; findMany: AnyMock };
    property: { count: AnyMock };
    auditLog: { create: AnyMock };
    $transaction: AnyMock;
  };

  beforeEach(async () => {
    prisma = {
      creditRequest: { findUnique: vi.fn(), update: vi.fn() },
      creditRequestHistory: { create: vi.fn(), findMany: vi.fn() },
      property: { count: vi.fn() },
      auditLog: { create: vi.fn() },
      $transaction: vi.fn(),
    };
    prisma.$transaction.mockImplementation(
      (callback: (tx: typeof prisma) => unknown) => callback(prisma),
    );
    prisma.property.count.mockResolvedValue(1);
    prisma.creditRequest.update.mockImplementation(
      ({ where, data }: { where: { id: string }; data: { status: string } }) =>
        Promise.resolve({
          ...baseCreditRequest(),
          id: where.id,
          status: data.status,
        }),
    );

    const moduleRef = await Test.createTestingModule({
      providers: [
        WorkflowService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = moduleRef.get(WorkflowService);
  });

  it('performs a valid transition and records history + audit atomically', async () => {
    prisma.creditRequest.findUnique.mockResolvedValue(baseCreditRequest());

    const result = await service.transition(
      'cr-1',
      'SUBMIT',
      { expectedUpdatedAt: UPDATED_AT.toISOString() },
      consultor,
    );

    expect(result.status).toBe('SUBMITTED_TO_MANAGER');
    expect(prisma.creditRequestHistory.create).toHaveBeenCalledWith({
      data: {
        creditRequestId: 'cr-1',
        fromStatus: 'DRAFT',
        toStatus: 'SUBMITTED_TO_MANAGER',
        actorId: consultor.id,
        reason: null,
      },
    });
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        userId: consultor.id,
        action: 'CREDIT_REQUEST_TRANSITION',
        entity: 'CreditRequest',
        entityId: 'cr-1',
        metadata: {
          action: 'SUBMIT',
          fromStatus: 'DRAFT',
          toStatus: 'SUBMITTED_TO_MANAGER',
        },
      },
    });
  });

  it('rejects a transition attempted by the wrong role', async () => {
    prisma.creditRequest.findUnique.mockResolvedValue(baseCreditRequest());

    await expect(
      service.transition(
        'cr-1',
        'APPROVE',
        { expectedUpdatedAt: UPDATED_AT.toISOString() },
        consultor,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects a transition from a status with no matching rule', async () => {
    prisma.creditRequest.findUnique.mockResolvedValue(
      baseCreditRequest({ status: 'APPROVED' }),
    );

    await expect(
      service.transition(
        'cr-1',
        'SUBMIT',
        { expectedUpdatedAt: UPDATED_AT.toISOString() },
        consultor,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('requires a reason for RETURN', async () => {
    prisma.creditRequest.findUnique.mockResolvedValue(
      baseCreditRequest({ status: 'MANAGER_REVIEW' }),
    );

    await expect(
      service.transition(
        'cr-1',
        'RETURN',
        { expectedUpdatedAt: UPDATED_AT.toISOString() },
        gerente,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('requires targetStatus when CREDITO returns from CREDIT_REVIEW (ambiguous destination)', async () => {
    prisma.creditRequest.findUnique.mockResolvedValue(
      baseCreditRequest({ status: 'CREDIT_REVIEW' }),
    );

    await expect(
      service.transition(
        'cr-1',
        'RETURN',
        { expectedUpdatedAt: UPDATED_AT.toISOString(), reason: 'faltam docs' },
        credito,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lets CREDITO skip the GERENTE and return straight to the CONSULTOR via targetStatus', async () => {
    prisma.creditRequest.findUnique.mockResolvedValue(
      baseCreditRequest({ status: 'CREDIT_REVIEW' }),
    );

    const result = await service.transition(
      'cr-1',
      'RETURN',
      {
        expectedUpdatedAt: UPDATED_AT.toISOString(),
        reason: 'documento do cliente pendente',
        targetStatus: 'RETURNED_TO_CONSULTANT',
      },
      credito,
    );

    expect(result.status).toBe('RETURNED_TO_CONSULTANT');
  });

  it('rejects a stale expectedUpdatedAt (concurrency guard)', async () => {
    prisma.creditRequest.findUnique.mockResolvedValue(baseCreditRequest());

    await expect(
      service.transition(
        'cr-1',
        'SUBMIT',
        { expectedUpdatedAt: new Date('2020-01-01').toISOString() },
        consultor,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('blocks SUBMIT from DRAFT when the client has no registered property', async () => {
    prisma.creditRequest.findUnique.mockResolvedValue(baseCreditRequest());
    prisma.property.count.mockResolvedValue(0);

    await expect(
      service.transition(
        'cr-1',
        'SUBMIT',
        { expectedUpdatedAt: UPDATED_AT.toISOString() },
        consultor,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects ownership-gated actions from a non-owning CONSULTOR', async () => {
    prisma.creditRequest.findUnique.mockResolvedValue(
      baseCreditRequest({ consultantId: 'someone-else' }),
    );

    await expect(
      service.transition(
        'cr-1',
        'SUBMIT',
        { expectedUpdatedAt: UPDATED_AT.toISOString() },
        consultor,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('lets ADMIN perform any role-gated transition without owning it', async () => {
    prisma.creditRequest.findUnique.mockResolvedValue(
      baseCreditRequest({ consultantId: 'someone-else' }),
    );

    const result = await service.transition(
      'cr-1',
      'SUBMIT',
      { expectedUpdatedAt: UPDATED_AT.toISOString() },
      admin,
    );

    expect(result.status).toBe('SUBMITTED_TO_MANAGER');
  });

  it('does not let ADMIN jump outside the defined transition graph', async () => {
    prisma.creditRequest.findUnique.mockResolvedValue(
      baseCreditRequest({ status: 'APPROVED' }),
    );

    await expect(
      service.transition(
        'cr-1',
        'SUBMIT',
        { expectedUpdatedAt: UPDATED_AT.toISOString() },
        admin,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  describe('getHistory', () => {
    it('denies a CONSULTOR access to another consultant credit request history', async () => {
      prisma.creditRequest.findUnique.mockResolvedValue(
        baseCreditRequest({ consultantId: 'someone-else' }),
      );

      await expect(
        service.getHistory('cr-1', consultor),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('returns the history ordered by creation time', async () => {
      prisma.creditRequest.findUnique.mockResolvedValue(baseCreditRequest());
      prisma.creditRequestHistory.findMany.mockResolvedValue([
        { id: 'h-1' },
        { id: 'h-2' },
      ]);

      const result = await service.getHistory('cr-1', consultor);

      expect(prisma.creditRequestHistory.findMany).toHaveBeenCalledWith({
        where: { creditRequestId: 'cr-1' },
        orderBy: { createdAt: 'asc' },
      });
      expect(result).toHaveLength(2);
    });
  });
});
