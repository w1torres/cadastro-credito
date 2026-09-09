import { Injectable, NotFoundException } from '@nestjs/common';
import { Client, Prisma, Property, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  paginate,
  PaginatedResult,
} from '../common/types/paginated-result.type.js';
import type { AuthUser } from '../auth/types/auth-user.type.js';
import { ClientsService } from '../clients/clients.service.js';
import { CreatePropertyDto } from './dto/create-property.dto.js';
import { UpdatePropertyDto } from './dto/update-property.dto.js';

@Injectable()
export class PropertiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clientsService: ClientsService,
  ) {}

  async create(dto: CreatePropertyDto, user: AuthUser): Promise<Property> {
    const client = await this.clientsService.findOneForUser(dto.clientId, user);
    this.clientsService.assertEditable(client, user);

    const { clientId, ...data } = dto;
    return this.prisma.property.create({ data: { ...data, clientId } });
  }

  async findAll(
    user: AuthUser,
    page: number,
    pageSize: number,
    clientId?: string,
  ): Promise<PaginatedResult<Property>> {
    const where: Prisma.PropertyWhereInput = {
      ...(user.role === Role.CONSULTOR
        ? { client: { consultantId: user.id } }
        : {}),
      ...(clientId ? { clientId } : {}),
    };
    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.property.count({ where }),
    ]);
    return paginate(properties, total, page, pageSize);
  }

  async findOneForUser(id: string, user: AuthUser): Promise<Property> {
    return this.findWithClient(id, user);
  }

  async update(
    id: string,
    dto: UpdatePropertyDto,
    user: AuthUser,
  ): Promise<Property> {
    const property = await this.findWithClient(id, user);
    this.clientsService.assertEditable(property.client, user);
    return this.prisma.property.update({
      where: { id: property.id },
      data: dto,
    });
  }

  /** Usado também pelo PropertyProductionService para validar acesso à propriedade pai. */
  async findWithClient(
    id: string,
    user: AuthUser,
  ): Promise<Property & { client: Client }> {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: { client: true },
    });
    if (!property) {
      throw new NotFoundException('Propriedade não encontrada.');
    }
    this.clientsService.assertVisible(property.client, user);
    return property;
  }
}
