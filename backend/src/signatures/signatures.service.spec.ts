import { Test } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Mock, vi } from 'vitest';
import { SignaturesService } from './signatures.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { StorageService } from '../storage/storage.service.js';
import { DocumentsService } from '../documents/documents.service.js';
import { CreditRequestsService } from '../credit-requests/credit-requests.service.js';
import { ClicksignAdapter } from './clicksign/clicksign-adapter.js';
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
  status: 'DRAFT',
};

function uniqueConstraintError() {
  return new Prisma.PrismaClientKnownRequestError('duplicate', {
    code: 'P2002',
    clientVersion: 'test',
  });
}

describe('SignaturesService', () => {
  let service: SignaturesService;
  let prisma: {
    signatureRequest: {
      findFirst: AnyMock;
      findUnique: AnyMock;
      create: AnyMock;
      update: AnyMock;
    };
    signatureEvent: { create: AnyMock };
    client: { findUniqueOrThrow: AnyMock };
    auditLog: { create: AnyMock };
    $transaction: AnyMock;
  };
  let storage: { readBuffer: AnyMock };
  let documentsService: { listByCreditRequest: AnyMock };
  let creditRequestsService: {
    findOneForUser: AnyMock;
    assertEditable: AnyMock;
  };
  let clicksign: {
    createEnvelope: AnyMock;
    addDocument: AnyMock;
    addSigner: AnyMock;
    activate: AnyMock;
  };

  beforeEach(async () => {
    prisma = {
      signatureRequest: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      signatureEvent: { create: vi.fn() },
      client: { findUniqueOrThrow: vi.fn() },
      auditLog: { create: vi.fn() },
      $transaction: vi.fn(),
    };
    prisma.$transaction.mockImplementation(
      (callback: (tx: typeof prisma) => unknown) => callback(prisma),
    );
    storage = {
      readBuffer: vi.fn().mockResolvedValue(Buffer.from('conteudo')),
    };
    documentsService = {
      listByCreditRequest: vi.fn().mockResolvedValue([
        {
          id: 'doc-1',
          type: 'AUTORIZACAO_SPC_BACEN',
          originalName: 'autorizacao-spc-bacen.pdf',
          storageKey: 'key-1',
        },
      ]),
    };
    creditRequestsService = {
      findOneForUser: vi.fn().mockResolvedValue(creditRequest),
      assertEditable: vi.fn(),
    };
    clicksign = {
      createEnvelope: vi
        .fn()
        .mockResolvedValue({ id: 'envelope-1', status: 'draft' }),
      addDocument: vi.fn().mockResolvedValue(undefined),
      addSigner: vi.fn().mockResolvedValue(undefined),
      activate: vi.fn().mockResolvedValue(undefined),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        SignaturesService,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: storage },
        { provide: DocumentsService, useValue: documentsService },
        { provide: CreditRequestsService, useValue: creditRequestsService },
        { provide: ClicksignAdapter, useValue: clicksign },
      ],
    }).compile();

    service = moduleRef.get(SignaturesService);
  });

  describe('requestSignature', () => {
    it('creates the envelope with documents + client/partners as signers, then persists the request', async () => {
      prisma.signatureRequest.findFirst.mockResolvedValue(null);
      prisma.client.findUniqueOrThrow.mockResolvedValue({
        id: 'client-1',
        name: 'Fulano',
        email: 'fulano@example.com',
        document: '12345678900',
        partners: [
          {
            name: 'Sócio',
            email: 'socio@example.com',
            document: '00011122233',
          },
        ],
      });
      prisma.signatureRequest.create.mockResolvedValue({
        id: 'sig-1',
        status: 'SENT',
      });

      const result = await service.requestSignature('cr-1', consultor);

      expect(clicksign.createEnvelope).toHaveBeenCalled();
      expect(clicksign.addDocument).toHaveBeenCalledWith('envelope-1', {
        filename: 'autorizacao-spc-bacen.pdf',
        contentBase64: Buffer.from('conteudo').toString('base64'),
      });
      expect(clicksign.addSigner).toHaveBeenCalledWith('envelope-1', {
        name: 'Fulano',
        email: 'fulano@example.com',
        documentationDigits: '12345678900',
      });
      expect(clicksign.addSigner).toHaveBeenCalledWith('envelope-1', {
        name: 'Sócio',
        email: 'socio@example.com',
        documentationDigits: '00011122233',
      });
      expect(clicksign.activate).toHaveBeenCalledWith('envelope-1');
      expect(prisma.signatureRequest.create).toHaveBeenCalledWith({
        data: {
          creditRequestId: 'cr-1',
          clicksignEnvelopeId: 'envelope-1',
          status: 'SENT',
          requestedById: consultor.id,
        },
      });
      expect(result).toEqual({ id: 'sig-1', status: 'SENT' });
    });

    it('rejects when there is already an open or signed request for this credit request', async () => {
      prisma.signatureRequest.findFirst.mockResolvedValue({
        id: 'sig-existing',
        status: 'SENT',
      });

      await expect(
        service.requestSignature('cr-1', consultor),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(clicksign.createEnvelope).not.toHaveBeenCalled();
    });

    it('rejects when no document has been attached yet', async () => {
      prisma.signatureRequest.findFirst.mockResolvedValue(null);
      documentsService.listByCreditRequest.mockResolvedValue([]);

      await expect(
        service.requestSignature('cr-1', consultor),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(clicksign.createEnvelope).not.toHaveBeenCalled();
    });

    it('rejects when only unrelated checklist documents exist but no AUTORIZACAO_SPC_BACEN', async () => {
      prisma.signatureRequest.findFirst.mockResolvedValue(null);
      documentsService.listByCreditRequest.mockResolvedValue([
        {
          id: 'doc-1',
          type: 'IMPOSTO_RENDA',
          originalName: 'ir.pdf',
          storageKey: 'key-1',
        },
        {
          id: 'doc-2',
          type: 'CAR',
          originalName: 'car.pdf',
          storageKey: 'key-2',
        },
      ]);

      await expect(
        service.requestSignature('cr-1', consultor),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(clicksign.createEnvelope).not.toHaveBeenCalled();
    });

    it('formats the CPF as required by Clicksign and excludes a PJ client (CNPJ) from the signer list, keeping only partners with a valid CPF', async () => {
      prisma.signatureRequest.findFirst.mockResolvedValue(null);
      prisma.client.findUniqueOrThrow.mockResolvedValue({
        id: 'client-1',
        name: 'Empresa LTDA',
        email: 'empresa@example.com',
        document: '11.222.333/0001-44', // CNPJ (14 dígitos) — pessoa jurídica não assina como titular
        partners: [
          {
            name: 'Sócio',
            email: 'socio@example.com',
            document: '123.456.789-00',
          },
        ],
      });
      prisma.signatureRequest.create.mockResolvedValue({
        id: 'sig-1',
        status: 'SENT',
      });

      await service.requestSignature('cr-1', consultor);

      expect(clicksign.addSigner).toHaveBeenCalledTimes(1);
      expect(clicksign.addSigner).toHaveBeenCalledWith('envelope-1', {
        name: 'Sócio',
        email: 'socio@example.com',
        documentationDigits: '12345678900',
      });
    });

    it('rejects when the client is PJ and no partner has a valid CPF', async () => {
      prisma.signatureRequest.findFirst.mockResolvedValue(null);
      prisma.client.findUniqueOrThrow.mockResolvedValue({
        id: 'client-1',
        name: 'Empresa LTDA',
        email: 'empresa@example.com',
        document: '11222333000144',
        partners: [],
      });

      await expect(
        service.requestSignature('cr-1', consultor),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(clicksign.createEnvelope).not.toHaveBeenCalled();
      expect(clicksign.addSigner).not.toHaveBeenCalled();
    });
  });

  describe('handleWebhookEvent', () => {
    it('is idempotent: the same clicksignEventId twice only updates status once', async () => {
      prisma.signatureRequest.findUnique.mockResolvedValue({
        id: 'sig-1',
        signedAt: null,
      });
      prisma.signatureEvent.create
        .mockResolvedValueOnce({ id: 'event-1' })
        .mockRejectedValueOnce(uniqueConstraintError());

      await service.handleWebhookEvent('evt-1', 'close', 'envelope-1', {
        raw: true,
      });
      await service.handleWebhookEvent('evt-1', 'close', 'envelope-1', {
        raw: true,
      });

      expect(prisma.signatureEvent.create).toHaveBeenCalledTimes(2);
      expect(prisma.signatureRequest.update).toHaveBeenCalledTimes(1);
      const [updateCall] = prisma.signatureRequest.update.mock.calls[0] as [
        { where: { id: string }; data: { status: string; signedAt: unknown } },
      ];
      expect(updateCall.where).toEqual({ id: 'sig-1' });
      expect(updateCall.data.status).toBe('SIGNED');
      expect(updateCall.data.signedAt).toBeInstanceOf(Date);
    });

    it('ignores webhook events for an envelope it does not know about', async () => {
      prisma.signatureRequest.findUnique.mockResolvedValue(null);

      await service.handleWebhookEvent(
        'evt-1',
        'close',
        'unknown-envelope',
        {},
      );

      expect(prisma.signatureEvent.create).not.toHaveBeenCalled();
      expect(prisma.signatureRequest.update).not.toHaveBeenCalled();
    });

    it('records the event but does not change status for an event with no mapped meaning', async () => {
      prisma.signatureRequest.findUnique.mockResolvedValue({
        id: 'sig-1',
        signedAt: null,
      });
      prisma.signatureEvent.create.mockResolvedValue({ id: 'event-1' });

      await service.handleWebhookEvent('evt-1', 'add_signer', 'envelope-1', {});

      expect(prisma.signatureEvent.create).toHaveBeenCalled();
      expect(prisma.signatureRequest.update).not.toHaveBeenCalled();
    });
  });
});
