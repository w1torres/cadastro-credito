import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthUser } from '../auth/types/auth-user.type.js';
import { ProductionService } from './production.service.js';
import { CreateProductionDto } from './dto/create-production.dto.js';
import { UpdateProductionDto } from './dto/update-production.dto.js';

@Roles(Role.CONSULTOR, Role.ADMIN)
@Controller()
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Post('properties/:propertyId/production')
  create(
    @Param('propertyId', ParseUUIDPipe) propertyId: string,
    @Body() dto: CreateProductionDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.productionService.create(propertyId, dto, user);
  }

  @Patch('production/:id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductionDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.productionService.update(id, dto, user);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('production/:id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<void> {
    return this.productionService.remove(id, user);
  }
}
