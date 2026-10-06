import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ETAPAS_EDICAO_CONSULTOR, ETAPAS_EDICAO_GERENTE } from '../credit-requests/workflow.types.js';
import { Client, Partner, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  paginate,
  PaginatedResult,
} from '../common/types/paginated-result.type.js';
import type { AuthUser } from '../auth/types/auth-user.type.js';
import { CreateClientDto } from './dto/create-client.dto.js';
import { UpdateClientDto } from './dto/update-client.dto.js';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClientDto, user: AuthUser): Promise<Client> {
    const existing = await this.prisma.client.findUnique({
      where: { document: dto.document },
    });
    if (existing) {
      throw new ConflictException(
        'Já existe um cliente cadastrado com este documento.',
      );
    }

    return this.prisma.client.create({
      data: { ...dto, consultantId: user.id },
    });
  }

  async findAll(
    user: AuthUser,
    page: number,
    pageSize: number,
  ): Promise<PaginatedResult<Client>> {
    const where: Prisma.ClientWhereInput =
      user.role === Role.CONSULTOR
        ? { consultantId: user.id }
        : user.role === Role.GERENTE
          ? { consultant: { branchId: user.branchId } }
          : {};
    const [clients, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.client.count({ where }),
    ]);
    return paginate(clients, total, page, pageSize);
  }

  /** Usado tambem por Properties/CreditRequests para validar o acesso ao cliente pai. */
  async findOneForUser(
    id: string,
    user: AuthUser,
  ): Promise<
    Client & {
      partners: Partner[];
      consultant: { branchId: string | null };
    }
  > {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        partners: true,
        consultant: { select: { branchId: true } },
      },
    });
    if (!client) {
      throw new NotFoundException('Cliente não encontrado.');
    }
    this.assertVisible(client, user);
    return client;
  }

  async update(
    id: string,
    dto: UpdateClientDto,
    user: AuthUser,
  ): Promise<Client> {
    const client = await this.findOneForUser(id, user);
    await this.assertCadastroEditavel(client.id, user);
    return this.prisma.client.update({ where: { id: client.id }, data: dto });
  }

  /**
   * CONSULTOR só enxerga os próprios clientes; GERENTE só enxerga clientes de
   * consultores da própria filial; CREDITO/ADMIN enxergam todos.
   */
  assertVisible(
    client: Pick<Client, 'consultantId'> & {
      consultant?: { branchId: string | null };
    },
    user: AuthUser,
  ): void {
    if (user.role === Role.CONSULTOR && client.consultantId !== user.id) {
      throw new ForbiddenException('Você não tem acesso a este cliente.');
    }
    if (
      user.role === Role.GERENTE &&
      client.consultant?.branchId !== user.branchId
    ) {
      throw new ForbiddenException('Você não tem acesso a este cliente.');
    }
  }

  /**
   * Cadastro do cliente (dados, sócios, fazendas) pode ser alterado conforme a
   * matriz de edição das solicitações do cliente:
   * - ADMIN: sempre;
   * - CONSULTOR dono: se ainda não há solicitação (cadastro em andamento) ou se há
   *   alguma solicitação em etapa de edição do consultor;
   * - GERENTE da filial: se há solicitação devolvida pelo crédito à sua filial.
   */
  async assertCadastroEditavel(clientId: string, user: AuthUser): Promise<void> {
    if (user.role === Role.ADMIN) return;

    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      select: {
        consultantId: true,
        creditRequests: {
          select: { status: true, consultant: { select: { branchId: true } } },
        },
      },
    });
    if (!client) {
      throw new NotFoundException('Cliente não encontrado.');
    }

    const solicitacoes = client.creditRequests;
    const permitido =
      user.role === Role.CONSULTOR
        ? client.consultantId === user.id &&
          (solicitacoes.length === 0 ||
            solicitacoes.some((s) => ETAPAS_EDICAO_CONSULTOR.includes(s.status)))
        : user.role === Role.GERENTE && !!user.branchId
          ? solicitacoes.some(
              (s) =>
                ETAPAS_EDICAO_GERENTE.includes(s.status) &&
                s.consultant.branchId === user.branchId,
            )
          : false;

    if (!permitido) {
      throw new ForbiddenException(
        'Você não tem permissão para alterar este cliente nesta etapa.',
      );
    }
  }
}
