import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma, SignatureRequest, SignatureStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { StorageService } from '../storage/storage.service.js';
import { DocumentsService } from '../documents/documents.service.js';
import { CreditRequestsService } from '../credit-requests/credit-requests.service.js';
import { recordAudit } from '../common/audit/record-audit.util.js';
import type { AuthUser } from '../auth/types/auth-user.type.js';
import { ClicksignAdapter } from './clicksign/clicksign-adapter.js';

const OPEN_STATUSES: SignatureStatus[] = [
  SignatureStatus.PENDING,
  SignatureStatus.SENT,
  SignatureStatus.VIEWED,
  SignatureStatus.SIGNED,
];

/**
 * Eventos que fecham o envelope com todos os signatários tendo assinado.
 * `sign` dispara por signatário individual (não indica o envelope inteiro
 * concluído) — por isso não entra aqui. Ajustar conforme os payloads reais
 * observados no sandbox (ver aviso em clicksign-adapter.ts).
 */
const SIGNED_EVENTS = new Set(['close', 'auto_close', 'document_closed']);
const DECLINED_EVENTS = new Set(['refusal']);
const EXPIRED_EVENTS = new Set(['deadline']);
const CANCELLED_EVENTS = new Set(['cancel']);

/**
 * A Clicksign só aceita CPF (11 dígitos) no campo `documentation` de um
 * signatário pessoa física — `Client.document`/`Partner.document` aceitam
 * CPF OU CNPJ (ver is-cpf-or-cnpj.validator.ts), então um cliente Pessoa
 * Jurídica não pode assinar como titular usando o CNPJ da empresa. Retorna
 * `null` para descartar (CNPJ, ou qualquer coisa que não seja exatamente 11 dígitos).
 */
function extractCpfDigits(document: string): string | null {
  const digits = document.replace(/\D/g, '');
  return digits.length === 11 ? digits : null;
}

function mapEventToStatus(eventType: string): SignatureStatus | null {
  if (SIGNED_EVENTS.has(eventType)) return SignatureStatus.SIGNED;
  if (DECLINED_EVENTS.has(eventType)) return SignatureStatus.DECLINED;
  if (EXPIRED_EVENTS.has(eventType)) return SignatureStatus.EXPIRED;
  if (CANCELLED_EVENTS.has(eventType)) return SignatureStatus.CANCELLED;
  if (eventType === 'signature_started') return SignatureStatus.VIEWED;
  return null;
}

@Injectable()
export class SignaturesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly documentsService: DocumentsService,
    private readonly creditRequestsService: CreditRequestsService,
    private readonly clicksign: ClicksignAdapter,
  ) {}

  /**
   * Dispara a autorização de consulta SPC/Bacen — só o Consultor dono (ou
   * ADMIN), ainda em DRAFT/RETURNED_TO_CONSULTANT, com pelo menos 1 documento
   * já anexado (ver requiresSignedAuthorization em workflow.types.ts).
   */
  async requestSignature(
    creditRequestId: string,
    user: AuthUser,
  ): Promise<SignatureRequest> {
    const creditRequest = await this.creditRequestsService.findOneForUser(
      creditRequestId,
      user,
    );
    this.creditRequestsService.assertEditable(creditRequest, user);

    if (
      creditRequest.status !== 'DRAFT' &&
      creditRequest.status !== 'RETURNED_TO_CONSULTANT'
    ) {
      throw new ConflictException(
        'Só é possível solicitar assinatura enquanto a solicitação está em rascunho ou devolvida para correção.',
      );
    }

    const existing = await this.prisma.signatureRequest.findFirst({
      where: { creditRequestId, status: { in: OPEN_STATUSES } },
    });
    if (existing) {
      throw new ConflictException(
        'Já existe uma solicitação de assinatura em andamento ou concluída para esta solicitação.',
      );
    }

    // Só o termo de autorização vai pro envelope — os demais documentos do
    // checklist (Fase 5) são anexos de apoio à análise, não algo que o
    // cliente deva ler/assinar aqui (ver ADR-018).
    const allDocuments = await this.documentsService.listByCreditRequest(
      creditRequestId,
      user,
    );
    const documents = allDocuments.filter(
      (document) => document.type === 'AUTORIZACAO_SPC_BACEN',
    );
    if (documents.length === 0) {
      throw new ConflictException(
        'Anexe o termo de autorização de consulta SPC/Bacen antes de solicitar a assinatura.',
      );
    }

    const client = await this.prisma.client.findUniqueOrThrow({
      where: { id: creditRequest.clientId },
      include: { partners: true },
    });

    const candidates = [
      { name: client.name, email: client.email, document: client.document },
      ...client.partners.map((partner) => ({
        name: partner.name,
        email: partner.email,
        document: partner.document,
      })),
    ];
    const signers = candidates
      .map((candidate) => ({
        name: candidate.name,
        email: candidate.email,
        documentationDigits: extractCpfDigits(candidate.document),
      }))
      .filter(
        (
          candidate,
        ): candidate is {
          name: string;
          email: string;
          documentationDigits: string;
        } => candidate.documentationDigits !== null,
      );
    if (signers.length === 0) {
      throw new ConflictException(
        'Nenhum CPF válido encontrado para assinar (o cliente é pessoa jurídica e nenhum sócio tem CPF cadastrado corretamente).',
      );
    }

    const envelope = await this.clicksign.createEnvelope(
      `Autorização de Consulta SPC/Bacen — ${client.name}`,
    );

    for (const document of documents) {
      const buffer = await this.storage.readBuffer(document.storageKey);
      await this.clicksign.addDocument(envelope.id, {
        filename: document.originalName,
        contentBase64: buffer.toString('base64'),
      });
    }

    for (const signer of signers) {
      await this.clicksign.addSigner(envelope.id, signer);
    }

    await this.clicksign.activate(envelope.id);

    return this.prisma.$transaction(async (tx) => {
      const signatureRequest = await tx.signatureRequest.create({
        data: {
          creditRequestId,
          clicksignEnvelopeId: envelope.id,
          status: SignatureStatus.SENT,
          requestedById: user.id,
        },
      });
      await recordAudit(tx, {
        userId: user.id,
        action: 'SIGNATURE_REQUESTED',
        entity: 'SignatureRequest',
        entityId: signatureRequest.id,
        metadata: { creditRequestId, clicksignEnvelopeId: envelope.id },
      });
      return signatureRequest;
    });
  }

  async getStatus(
    creditRequestId: string,
    user: AuthUser,
  ): Promise<SignatureRequest | null> {
    await this.creditRequestsService.findOneForUser(creditRequestId, user);
    return this.prisma.signatureRequest.findFirst({
      where: { creditRequestId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Idempotente por `clicksignEventId` (constraint única — evento repetido
   * vira no-op silencioso, spec 07: "idempotência"). Envelope desconhecido
   * (fora deste fluxo) também é ignorado, não é erro do chamador.
   */
  async handleWebhookEvent(
    clicksignEventId: string,
    eventType: string,
    envelopeId: string,
    payload: unknown,
  ): Promise<void> {
    const signatureRequest = await this.prisma.signatureRequest.findUnique({
      where: { clicksignEnvelopeId: envelopeId },
    });
    if (!signatureRequest) return;

    try {
      await this.prisma.signatureEvent.create({
        data: {
          signatureRequestId: signatureRequest.id,
          clicksignEventId,
          eventType,
          payload: payload as Prisma.InputJsonValue,
        },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        return;
      }
      throw err;
    }

    const nextStatus = mapEventToStatus(eventType);
    if (!nextStatus) return;

    await this.prisma.signatureRequest.update({
      where: { id: signatureRequest.id },
      data: {
        status: nextStatus,
        signedAt:
          nextStatus === SignatureStatus.SIGNED
            ? new Date()
            : signatureRequest.signedAt,
      },
    });
  }
}
