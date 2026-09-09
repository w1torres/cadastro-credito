import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Client, Role } from '@prisma/client';
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
    const where = user.role === Role.CONSULTOR ? { consultantId: user.id } : {};
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
  async findOneForUser(id: string, user: AuthUser): Promise<Client> {
    const client = await this.prisma.client.findUnique({ where: { id } });
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
    this.assertEditable(client, user);
    return this.prisma.client.update({ where: { id: client.id }, data: dto });
  }

  /** CONSULTOR só enxerga os próprios clientes; GERENTE/CREDITO/ADMIN enxergam todos. */
  assertVisible(client: Pick<Client, 'consultantId'>, user: AuthUser): void {
    if (user.role === Role.CONSULTOR && client.consultantId !== user.id) {
      throw new ForbiddenException('Você não tem acesso a este cliente.');
    }
  }

  /** Apenas o CONSULTOR dono do cliente, ou um ADMIN, podem editar. */
  assertEditable(client: Pick<Client, 'consultantId'>, user: AuthUser): void {
    const canEdit =
      user.role === Role.ADMIN ||
      (user.role === Role.CONSULTOR && client.consultantId === user.id);
    if (!canEdit) {
      throw new ForbiddenException(
        'Você não tem permissão para alterar este cliente.',
      );
    }
  }
}
