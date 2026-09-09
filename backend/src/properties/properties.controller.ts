import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { IsOptional, IsString } from 'class-validator';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthUser } from '../auth/types/auth-user.type.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { PropertiesService } from './properties.service.js';
import { CreatePropertyDto } from './dto/create-property.dto.js';
import { UpdatePropertyDto } from './dto/update-property.dto.js';

class ListPropertiesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  clientId?: string;
}

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Roles(Role.CONSULTOR, Role.ADMIN)
  @Post()
  create(@Body() dto: CreatePropertyDto, @CurrentUser() user: AuthUser) {
    return this.propertiesService.create(dto, user);
  }

  @Get()
  findAll(
    @Query() query: ListPropertiesQueryDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.propertiesService.findAll(
      user,
      query.page ?? 1,
      query.pageSize ?? 20,
      query.clientId,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.propertiesService.findOneForUser(id, user);
  }

  @Roles(Role.CONSULTOR, Role.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePropertyDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.propertiesService.update(id, dto, user);
  }
}
