import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreditRequest,
  CreditRequestHistory,
  DocumentPendencyMotivo,
  DocumentType,
  Prisma,
  Role,
} from '@prisma/client';
import { DOCUMENT_CHECKLIST_TYPES } from './constants.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { recordAudit } from '../common/audit/record-audit.util.js';
import type { AuthUser } from '../auth/types/auth-user.type.js';
import {
  TRANSITIONS,
  TransitionInput,
  TransitionRule,
  WorkflowAction,
} from './workflow.types.js';

@Injectable()
export class WorkflowService {
  constructor(private readonly prisma: PrismaService) {}

  async transition(
    id: string,
    action: WorkflowAction,
    input: TransitionInput,
    user: AuthUser,
  ): Promise<CreditRequest> {
    const creditRequest = await this.findOwned(id);

    if (creditRequest.updatedAt.toISOString() !== input.expectedUpdatedAt) {
      throw new ConflictException(
        'A solicitação foi alterada por outro usuário. Recarregue e tente novamente.',
      );
    }

    const rule = this.resolveRule(
      creditRequest.status,
      action,
      user.role,
      input.targetStatus,
    );

    if (
      rule.requiresOwnership &&
      user.role !== Role.ADMIN &&
      creditRequest.consultantId !== user.id
    ) {
      throw new ForbiddenException(
        'Você não tem permissão para executar esta ação nesta solicitação.',
      );
    }

    if (rule.requiresReason && !input.reason?.trim()) {
      throw new BadRequestException('Motivo é obrigatório para esta ação.');
    }

    if (rule.requiresMinProperty) {
      const propertyCount = await this.prisma.property.count({
        where: { clientId: creditRequest.clientId },
      });
      if (propertyCount < 1) {
        throw new ConflictException(
          'É necessário cadastrar ao menos uma propriedade do cliente antes de enviar a solicitação.',
        );
      }
    }

    if (rule.requiresSignedAuthorization) {
      const signed = await this.prisma.signatureRequest.findFirst({
        where: { creditRequestId: id, status: 'SIGNED' },
      });
      if (!signed) {
        throw new ConflictException(
          'É necessário que o cliente assine a autorização de consulta ao SPC/Bacen antes de enviar a solicitação.',
        );
      }
    }

    if (rule.requiresSemPendencias) {
      const pendencias = await this.prisma.documentPendency.count({
        where: { creditRequestId: id },
      });
      if (pendencias > 0) {
        throw new ConflictException(
          'Há documentos pendentes. Anexe os documentos indicados antes de enviar ao gerente.',
        );
      }
    }

    if (rule.requiresFichaAprovadaSemPendencias) {
      const pendencias = await this.prisma.documentPendency.count({
        where: { creditRequestId: id },
      });
      if (pendencias > 0) {
        throw new ConflictException(
          'Há documentos pendentes marcados pelo gerente. Resolva as pendências antes de enviar ao crédito.',
        );
      }
      if (creditRequest.fichaCadastralSituacao !== 'APROVADA') {
        throw new ConflictException(
          'A ficha cadastral precisa estar aprovada antes de enviar a solicitação ao crédito.',
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.creditRequest.update({
        where: { id },
        data: { status: rule.to },
      });
      await tx.creditRequestHistory.create({
        data: {
          creditRequestId: id,
          fromStatus: rule.from,
          toStatus: rule.to,
          actorId: user.id,
          reason: input.reason?.trim() || null,
        },
      });
      if (action === 'RETURN' && input.pendencias) {
        await this.substituirPendencias(tx, id, input.pendencias, user.id);
      }
      await recordAudit(tx, {
        userId: user.id,
        action: 'CREDIT_REQUEST_TRANSITION',
        entity: 'CreditRequest',
        entityId: id,
        metadata: { action, fromStatus: rule.from, toStatus: rule.to },
      });
      return updated;
    });
  }

  /**
   * Substitui as pendências de documento pela lista informada na devolução.
   * Lista vazia remove todas. Roda dentro da mesma transação da transição.
   */
  private async substituirPendencias(
    tx: Prisma.TransactionClient,
    creditRequestId: string,
    pendencias: { type: DocumentType; motivo: DocumentPendencyMotivo }[],
    actorId: string,
  ): Promise<void> {
    const tipos = pendencias.map((item) => item.type);
    if (new Set(tipos).size !== tipos.length) {
      throw new BadRequestException('Documento informado mais de uma vez na devolução.');
    }
    if (!tipos.every((tipo) => DOCUMENT_CHECKLIST_TYPES.includes(tipo))) {
      throw new BadRequestException('Documento fora do checklist de pendências.');
    }

    await tx.documentPendency.deleteMany({ where: { creditRequestId } });
    if (pendencias.length > 0) {
      await tx.documentPendency.createMany({
        data: pendencias.map((item) => ({
          creditRequestId,
          type: item.type,
          motivo: item.motivo,
          markedById: actorId,
        })),
      });
    }
    await recordAudit(tx, {
      userId: actorId,
      action: 'DOCUMENT_PENDENCIES_RETURNED',
      entity: 'CreditRequest',
      entityId: creditRequestId,
      metadata: { pendencias },
    });
  }

  async getHistory(
    id: string,
    user: AuthUser,
  ): Promise<CreditRequestHistory[]> {
    const creditRequest = await this.findOwned(id);
    this.assertVisible(creditRequest, user);
    return this.prisma.creditRequestHistory.findMany({
      where: { creditRequestId: id },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Resolve a regra de transição aplicável. Quando mais de um destino é
   * possível para a mesma (etapa atual, ação, papel) — hoje, apenas o CRÉDITO
   * devolvendo de CREDIT_REVIEW (para o GERENTE ou, pulando-o, direto ao
   * CONSULTOR) — `targetStatus` passa a ser obrigatório para desambiguar.
   */
  private resolveRule(
    status: CreditRequest['status'],
    action: WorkflowAction,
    role: Role,
    targetStatus: TransitionInput['targetStatus'],
  ): TransitionRule {
    const candidates = TRANSITIONS.filter(
      (rule) =>
        rule.action === action &&
        rule.from === status &&
        (role === Role.ADMIN || rule.roles.includes(role)),
    );

    if (candidates.length === 0) {
      throw new ConflictException({
        error: 'WORKFLOW_INVALID_TRANSITION',
        message: 'A solicitação não pode realizar esta ação neste estado.',
      });
    }

    if (candidates.length === 1) {
      const [rule] = candidates;
      if (targetStatus && targetStatus !== rule.to) {
        throw new ConflictException({
          error: 'WORKFLOW_INVALID_TRANSITION',
          message: 'Etapa destino informada não é válida para esta ação.',
        });
      }
      return rule;
    }

    if (!targetStatus) {
      throw new BadRequestException(
        'Etapa destino é obrigatória para esta devolução.',
      );
    }
    const match = candidates.find((rule) => rule.to === targetStatus);
    if (!match) {
      throw new ConflictException({
        error: 'WORKFLOW_INVALID_TRANSITION',
        message: 'Etapa destino informada não é válida para esta ação.',
      });
    }
    return match;
  }

  private async findOwned(
    id: string,
  ): Promise<CreditRequest & { consultant: { branchId: string | null } }> {
    const creditRequest = await this.prisma.creditRequest.findUnique({
      where: { id },
      include: { consultant: { select: { branchId: true } } },
    });
    if (!creditRequest) {
      throw new NotFoundException('Solicitação de crédito não encontrada.');
    }
    return creditRequest;
  }

  private assertVisible(
    creditRequest: Pick<CreditRequest, 'consultantId'> & {
      consultant?: { branchId: string | null };
    },
    user: AuthUser,
  ): void {
    if (
      user.role === Role.CONSULTOR &&
      creditRequest.consultantId !== user.id
    ) {
      throw new ForbiddenException('Você não tem acesso a esta solicitação.');
    }
    if (
      user.role === Role.GERENTE &&
      creditRequest.consultant?.branchId !== user.branchId
    ) {
      throw new ForbiddenException('Você não tem acesso a esta solicitação.');
    }
  }
}
