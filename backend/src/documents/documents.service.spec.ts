import { Test } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Mock, vi } from 'vitest';
import { DocumentsService } from './documents.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { StorageService } from '../storage/storage.service.js';
import { CreditRequestsService } from '../credit-requests/credit-requests.service.js';
import type { AuthUser } from '../auth/types/auth-user.type.js';

type AnyMock = Mock<(...args: any[]) => any>;

const consultor: AuthUser = {
  id: 'consultor-1',
  name: 'Consultor',
  email: 'consultor@example.com',
  role: 'CONSULTOR',
  branchId: 'branch-1',
};

const creditRequest = {
  id: 'cr-1',
  clientId: 'client-1',
  consultantId: consultor.id,
};

describe('DocumentsService', () => {
  let service: DocumentsService;
  let prisma: {
    document: {
      create: AnyMock;
      findMany: AnyMock;
      findUnique: AnyMock;
      delete: AnyMock;
    };
    auditLog: { create: AnyMock };
    $transaction: AnyMock;
  };
  let storage: {
    buildKey: AnyMock;
    save: AnyMock;
    readStream: AnyMock;
    delete: AnyMock;
  };
  let creditRequestsService: {
    findOneForUser: AnyMock;
    assertEditable: AnyMock;
  };

  beforeEach(async () => {
    prisma = {
      document: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        delete: vi.fn(),
      },
      auditLog: { create: vi.fn() },
      $transaction: vi.fn(),
    };
    prisma.$transaction.mockImplementation(
      (callback: (tx: typeof prisma) => unknown) => callback(prisma),
    );
    storage = {
      buildKey: vi
        .fn()
        .mockReturnValue('credit-requests/cr-1/uuid-arquivo.pdf'),
      save: vi.fn().mockResolvedValue(undefined),
      readStream: vi.fn(),
      delete: vi.fn().mockResolvedValue(undefined),
    };
    creditRequestsService = {
      findOneForUser: vi.fn().mockResolvedValue(creditRequest),
      assertEditable: vi.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        DocumentsService,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: storage },
        { provide: CreditRequestsService, useValue: creditRequestsService },
      ],
    }).compile();

    service = moduleRef.get(DocumentsService);
  });

  it('uploads a document: saves the file, persists metadata and records audit', async () => {
    const file = {
      originalname: 'imposto-renda.pdf',
      mimetype: 'application/pdf',
      size: 1234,
      buffer: Buffer.from('conteudo'),
    };
    prisma.document.create.mockResolvedValue({ id: 'doc-1' });

    const result = await service.upload(
      'cr-1',
      file,
      { type: 'IMPOSTO_RENDA' },
      consultor,
    );

    expect(creditRequestsService.findOneForUser).toHaveBeenCalledWith(
      'cr-1',
      consultor,
    );
    expect(creditRequestsService.assertEditable).toHaveBeenCalledWith(
      creditRequest,
      consultor,
    );
    expect(storage.save).toHaveBeenCalledWith(
      'credit-requests/cr-1/uuid-arquivo.pdf',
      file.buffer,
    );
    expect(prisma.document.create).toHaveBeenCalledWith({
      data: {
        creditRequestId: 'cr-1',
        type: 'IMPOSTO_RENDA',
        originalName: 'imposto-renda.pdf',
        storageKey: 'credit-requests/cr-1/uuid-arquivo.pdf',
        mimeType: 'application/pdf',
        size: 1234,
        uploadedById: consultor.id,
      },
    });
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        userId: consultor.id,
        action: 'DOCUMENT_UPLOADED',
        entity: 'Document',
        entityId: 'doc-1',
        metadata: { creditRequestId: 'cr-1', type: 'IMPOSTO_RENDA' },
      },
    });
    expect(result).toEqual({ id: 'doc-1' });
  });

  it('does not save the file when the user cannot edit the credit request', async () => {
    creditRequestsService.assertEditable.mockImplementation(() => {
      throw new ForbiddenException();
    });

    await expect(
      service.upload(
        'cr-1',
        {
          originalname: 'x.pdf',
          mimetype: 'application/pdf',
          size: 1,
          buffer: Buffer.from('x'),
        },
        { type: 'OUTROS' },
        consultor,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(storage.save).not.toHaveBeenCalled();
  });

  it('lists documents for anyone who can view the credit request (visibility, not edit)', async () => {
    prisma.document.findMany.mockResolvedValue([{ id: 'doc-1' }]);

    const result = await service.listByCreditRequest('cr-1', consultor);

    expect(creditRequestsService.findOneForUser).toHaveBeenCalledWith(
      'cr-1',
      consultor,
    );
    expect(creditRequestsService.assertEditable).not.toHaveBeenCalled();
    expect(result).toEqual([{ id: 'doc-1' }]);
  });

  it('removes a document: deletes the DB row, records audit, then deletes the stored file', async () => {
    prisma.document.findUnique.mockResolvedValue({
      id: 'doc-1',
      creditRequestId: 'cr-1',
      storageKey: 'credit-requests/cr-1/uuid-arquivo.pdf',
    });

    await service.remove('doc-1', consultor);

    expect(prisma.document.delete).toHaveBeenCalledWith({
      where: { id: 'doc-1' },
    });
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        userId: consultor.id,
        action: 'DOCUMENT_REMOVED',
        entity: 'Document',
        entityId: 'doc-1',
        metadata: { creditRequestId: 'cr-1' },
      },
    });
    expect(storage.delete).toHaveBeenCalledWith(
      'credit-requests/cr-1/uuid-arquivo.pdf',
    );
  });

  it('throws NotFoundException when the document does not exist', async () => {
    prisma.document.findUnique.mockResolvedValue(null);

    await expect(service.remove('missing', consultor)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
