import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PropertyProduction } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AuthUser } from '../auth/types/auth-user.type.js';
import { ClientsService } from '../clients/clients.service.js';
import { PropertiesService } from './properties.service.js';
import { CreateProductionDto } from './dto/create-production.dto.js';
import { UpdateProductionDto } from './dto/update-production.dto.js';

@Injectable()
export class ProductionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly propertiesService: PropertiesService,
    private readonly clientsService: ClientsService,
  ) {}

  async create(
    propertyId: string,
    dto: CreateProductionDto,
    user: AuthUser,
  ): Promise<PropertyProduction> {
    const property = await this.propertiesService.findWithClient(
      propertyId,
      user,
    );
    this.clientsService.assertEditable(property.client, user);

    const existing = await this.prisma.propertyProduction.findUnique({
      where: {
        propertyId_harvestYear_cropName: {
          propertyId,
          harvestYear: dto.harvestYear,
          cropName: dto.cropName,
        },
      },
    });
    if (existing) {
      throw new ConflictException(
        'Esta cultura já está registrada para esta propriedade nesta safra.',
      );
    }

    return this.prisma.propertyProduction.create({
      data: { ...dto, propertyId },
    });
  }

  async update(
    id: string,
    dto: UpdateProductionDto,
    user: AuthUser,
  ): Promise<PropertyProduction> {
    const production = await this.findOneWithProperty(id, user);
    return this.prisma.propertyProduction.update({
      where: { id: production.id },
      data: dto,
    });
  }

  async remove(id: string, user: AuthUser): Promise<void> {
    const production = await this.findOneWithProperty(id, user);
    await this.prisma.propertyProduction.delete({
      where: { id: production.id },
    });
  }

  private async findOneWithProperty(
    id: string,
    user: AuthUser,
  ): Promise<PropertyProduction> {
    const production = await this.prisma.propertyProduction.findUnique({
      where: { id },
    });
    if (!production) {
      throw new NotFoundException('Registro de produção não encontrado.');
    }

    const property = await this.propertiesService.findWithClient(
      production.propertyId,
      user,
    );
    this.clientsService.assertEditable(property.client, user);
    return production;
  }
}
