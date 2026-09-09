import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Client, Partner } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AuthUser } from '../auth/types/auth-user.type.js';
import { ClientsService } from './clients.service.js';
import { CreatePartnerDto } from './dto/create-partner.dto.js';
import { UpdatePartnerDto } from './dto/update-partner.dto.js';

@Injectable()
export class PartnersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clientsService: ClientsService,
  ) {}

  async create(
    clientId: string,
    dto: CreatePartnerDto,
    user: AuthUser,
  ): Promise<Partner> {
    const client = await this.clientsService.findOneForUser(clientId, user);
    this.clientsService.assertEditable(client, user);

    const existing = await this.prisma.partner.findUnique({
      where: { clientId_document: { clientId, document: dto.document } },
    });
    if (existing) {
      throw new ConflictException(
        'Este sócio já está cadastrado para este cliente.',
      );
    }

    return this.prisma.partner.create({ data: { ...dto, clientId } });
  }

  async update(
    id: string,
    dto: UpdatePartnerDto,
    user: AuthUser,
  ): Promise<Partner> {
    const partner = await this.findOneWithClient(id);
    this.clientsService.assertEditable(partner.client, user);
    return this.prisma.partner.update({ where: { id }, data: dto });
  }

  async remove(id: string, user: AuthUser): Promise<void> {
    const partner = await this.findOneWithClient(id);
    this.clientsService.assertEditable(partner.client, user);
    await this.prisma.partner.delete({ where: { id } });
  }

  private async findOneWithClient(
    id: string,
  ): Promise<Partner & { client: Client }> {
    const partner = await this.prisma.partner.findUnique({
      where: { id },
      include: { client: true },
    });
    if (!partner) {
      throw new NotFoundException('Sócio não encontrado.');
    }
    return partner;
  }
}
