import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreditRequest,
  CreditRequestStatus,
  Prisma,
  Role,
} from '@prisma/client';
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
  ): Promise<PaginatedResult<CreditRequest>> {
    const where: Prisma.CreditRequestWhereInput = {
      ...(user.role === Role.CONSULTOR ? { consultantId: user.id } : {}),
      ...(clientId ? { clientId } : {}),
      ...(status ? { status } : {}),
    };
    const [creditRequests, total] = await Promise.all([
      this.prisma.creditRequest.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
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

  private async findOwned(id: string): Promise<CreditRequest> {
    const creditRequest = await this.prisma.creditRequest.findUnique({
      where: { id },
    });
    if (!creditRequest) {
      throw new NotFoundException('Solicitação de crédito não encontrada.');
    }
    return creditRequest;
  }

  private assertVisible(
    creditRequest: Pick<CreditRequest, 'consultantId'>,
    user: AuthUser,
  ): void {
    if (
      user.role === Role.CONSULTOR &&
      creditRequest.consultantId !== user.id
    ) {
      throw new ForbiddenException('Você não tem acesso a esta solicitação.');
    }
  }

  private assertEditable(
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
