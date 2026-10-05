import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreditRequest,
  CreditRequestStatus,
  DocumentType,
  FichaCadastralSituacao,
  Prisma,
  Role,
} from '@prisma/client';
import { DOCUMENT_CHECKLIST_TYPES } from './constants.js';
import { SetDocumentPendenciesDto } from './dto/set-document-pendencies.dto.js';
import { SetFichaCadastralDto } from './dto/set-ficha-cadastral.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { recordAudit } from '../common/audit/record-audit.util.js';
import {
  paginate,
  PaginatedResult,
} from '../common/types/paginated-result.type.js';
import type { AuthUser } from '../auth/types/auth-user.type.js';
import { ClientsService } from '../clients/clients.service.js';
import { CreateCreditRequestDto } from './dto/create-credit-request.dto.js';
import { UpdateCreditRequestDto } from './dto/update-credit-request.dto.js';

/** Etapas em que a solicitação ainda está "nas mãos" do consultor e pode ter seus campos editados (Fase 3, bullet "permissões"). */
const EDITABLE_STATUSES: CreditRequestStatus[] = [
  CreditRequestStatus.DRAFT,
  CreditRequestStatus.RETURNED_TO_CONSULTANT,
];

const CONSULTANT_SELECT = {
  id: true,
  name: true,
  branchId: true,
  branch: { select: { id: true, name: true } },
} as const;

type ConsultantSummary = {
  id: string;
  name: string;
  branchId: string | null;
  branch: { id: string; name: string } | null;
};

@Injectable()
export class CreditRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clientsService: ClientsService,
  ) {}

  async create(
    dto: CreateCreditRequestDto,
    user: AuthUser,
  ): Promise<CreditRequest> {
    const client = await this.clientsService.findOneForUser(dto.clientId, user);
    this.clientsService.assertEditable(client, user);

    const { clientId, ...data } = dto;
    return this.prisma.$transaction(async (tx) => {
      const creditRequest = await tx.creditRequest.create({
        data: {
          ...data,
          clientId,
          consultantId: user.id,
          status: CreditRequestStatus.DRAFT,
        },
      });
      await tx.creditRequestHistory.create({
        data: {
          creditRequestId: creditRequest.id,
          fromStatus: null,
          toStatus: CreditRequestStatus.DRAFT,
          actorId: user.id,
        },
      });
      await recordAudit(tx, {
        userId: user.id,
        action: 'CREDIT_REQUEST_CREATED',
        entity: 'CreditRequest',
        entityId: creditRequest.id,
      });
      return creditRequest;
    });
  }

  async findAll(
    user: AuthUser,
    page: number,
    pageSize: number,
    clientId?: string,
    status?: CreditRequestStatus,
  ): Promise<
    PaginatedResult<CreditRequest & { consultant: ConsultantSummary }>
  > {
    const where: Prisma.CreditRequestWhereInput = {
      ...(user.role === Role.CONSULTOR
        ? { consultantId: user.id }
        : user.role === Role.GERENTE
          ? { consultant: { branchId: user.branchId } }
          : {}),
      ...(clientId ? { clientId } : {}),
      ...(status ? { status } : {}),
    };
    const [creditRequests, total] = await Promise.all([
      this.prisma.creditRequest.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          consultant: { select: CONSULTANT_SELECT },
          documentPendencies: { select: { type: true, motivo: true } },
        },
      }),
      this.prisma.creditRequest.count({ where }),
    ]);
    return paginate(creditRequests, total, page, pageSize);
  }

  async findOneForUser(id: string, user: AuthUser): Promise<CreditRequest> {
    const creditRequest = await this.findOwned(id);
    this.assertVisible(creditRequest, user);
    return creditRequest;
  }

  async update(
    id: string,
    dto: UpdateCreditRequestDto,
    user: AuthUser,
  ): Promise<CreditRequest> {
    const creditRequest = await this.findOwned(id);
    this.assertEditable(creditRequest, user);
    if (!EDITABLE_STATUSES.includes(creditRequest.status)) {
      throw new ConflictException(
        'Só é possível editar a solicitação enquanto ela está em rascunho ou devolvida para correção.',
      );
    }
    return this.prisma.creditRequest.update({ where: { id }, data: dto });
  }

  async remove(id: string, user: AuthUser): Promise<void> {
    const creditRequest = await this.findOwned(id);
    this.assertEditable(creditRequest, user);
    if (creditRequest.status !== CreditRequestStatus.DRAFT) {
      throw new ConflictException(
        'Somente solicitações em rascunho podem ser excluídas.',
      );
    }
    await this.prisma.creditRequest.delete({ where: { id } });
  }

  /**
   * Substitui a lista de documentos pendentes da solicitação. Só GERENTE (da
   * filial, durante a análise dele) ou CREDITO (durante a análise de crédito)
   * podem marcar pendências; ADMIN pode em qualquer etapa.
   */
  async setDocumentPendencies(
    id: string,
    dto: SetDocumentPendenciesDto,
    user: AuthUser,
  ): Promise<DocumentType[]> {
    const creditRequest = await this.findOwned(id);
    this.assertVisible(creditRequest, user);
    this.assertCanReview(creditRequest, user);

    const desejados = new Set(dto.types);
    if (![...desejados].every((tipo) => DOCUMENT_CHECKLIST_TYPES.includes(tipo))) {
      throw new BadRequestException('Documento fora do checklist de pendências.');
    }

    return this.prisma.$transaction(async (tx) => {
      const atuais = await tx.documentPendency.findMany({
        where: { creditRequestId: id },
        select: { type: true },
      });
      const atuaisSet = new Set(atuais.map((p) => p.type));
      const removidos = [...atuaisSet].filter((tipo) => !desejados.has(tipo));
      const adicionados = [...desejados].filter((tipo) => !atuaisSet.has(tipo));

      if (removidos.length > 0) {
        await tx.documentPendency.deleteMany({
          where: { creditRequestId: id, type: { in: removidos } },
        });
      }
      if (adicionados.length > 0) {
        await tx.documentPendency.createMany({
          data: adicionados.map((type) => ({
            creditRequestId: id,
            type,
            markedById: user.id,
          })),
        });
      }
      if (removidos.length > 0 || adicionados.length > 0) {
        await recordAudit(tx, {
          userId: user.id,
          action: 'DOCUMENT_PENDENCIES_UPDATED',
          entity: 'CreditRequest',
          entityId: id,
          metadata: { adicionados, removidos },
        });
      }
      return [...desejados];
    });
  }

  /**
   * Define a situação da ficha cadastral (EM_ANALISE, APROVADA ou REPROVADA).
   * Mesma regra de quem pode revisar as pendências.
   */
  async setFichaCadastral(
    id: string,
    dto: SetFichaCadastralDto,
    user: AuthUser,
  ): Promise<CreditRequest> {
    const creditRequest = await this.findOwned(id);
    this.assertVisible(creditRequest, user);
    this.assertCanReview(creditRequest, user);

    const motivo = dto.motivo?.trim() || null;
    if (dto.situacao === FichaCadastralSituacao.REPROVADA && !motivo) {
      throw new BadRequestException('Informe o motivo da reprovação da ficha cadastral.');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.creditRequest.update({
        where: { id },
        data: {
          fichaCadastralSituacao: dto.situacao,
          fichaCadastralMotivo:
            dto.situacao === FichaCadastralSituacao.REPROVADA ? motivo : null,
          fichaCadastralRevisadaEm: new Date(),
        },
      });
      await recordAudit(tx, {
        userId: user.id,
        action: 'FICHA_CADASTRAL_UPDATED',
        entity: 'CreditRequest',
        entityId: id,
        metadata: {
          de: creditRequest.fichaCadastralSituacao,
          para: dto.situacao,
          motivo: dto.situacao === FichaCadastralSituacao.REPROVADA ? motivo : null,
        },
      });
      return updated;
    });
  }

  /**
   * GERENTE revisa só durante a análise dele; CREDITO só na análise de crédito.
   * ADMIN passa em qualquer etapa.
   */
  private assertCanReview(
    creditRequest: Pick<CreditRequest, 'status'>,
    user: AuthUser,
  ): void {
    const etapasPorPapel: Partial<Record<Role, CreditRequestStatus[]>> = {
      [Role.GERENTE]: [
        CreditRequestStatus.SUBMITTED_TO_MANAGER,
        CreditRequestStatus.MANAGER_REVIEW,
        CreditRequestStatus.RETURNED_TO_MANAGER,
      ],
      [Role.CREDITO]: [
        CreditRequestStatus.SUBMITTED_TO_CREDIT,
        CreditRequestStatus.CREDIT_REVIEW,
      ],
    };
    if (user.role === Role.ADMIN) return;
    const permitidas = etapasPorPapel[user.role];
    if (!permitidas) {
      throw new ForbiddenException('Você não tem permissão para revisar esta solicitação.');
    }
    if (!permitidas.includes(creditRequest.status)) {
      throw new ConflictException(
        'A solicitação não está em uma etapa de análise que permita esta alteração.',
      );
    }
  }

  private async findOwned(
    id: string,
  ): Promise<CreditRequest & { consultant: ConsultantSummary }> {
    const creditRequest = await this.prisma.creditRequest.findUnique({
      where: { id },
      include: {
        consultant: { select: CONSULTANT_SELECT },
        documentPendencies: { select: { type: true, motivo: true } },
      },
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

  /**
   * Pública (não `private`) porque DocumentsService/SignaturesService (Fases
   * 5/6) reaproveitam exatamente esta regra em vez de duplicá-la — "dono
   * CONSULTOR ou ADMIN" é a mesma checagem para editar a solicitação, subir
   * documento ou disparar assinatura.
   */
  assertEditable(
    creditRequest: Pick<CreditRequest, 'consultantId'>,
    user: AuthUser,
  ): void {
    const canEdit =
      user.role === Role.ADMIN ||
      (user.role === Role.CONSULTOR && creditRequest.consultantId === user.id);
    if (!canEdit) {
      throw new ForbiddenException(
        'Você não tem permissão para alterar esta solicitação.',
      );
    }
  }
}
