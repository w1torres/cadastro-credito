import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreditRequestStatus, Role } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthUser } from '../auth/types/auth-user.type.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { CreditRequestsService } from './credit-requests.service.js';
import { CreateCreditRequestDto } from './dto/create-credit-request.dto.js';
import { UpdateCreditRequestDto } from './dto/update-credit-request.dto.js';

class ListCreditRequestsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsEnum(CreditRequestStatus)
  status?: CreditRequestStatus;
}

@Controller('credit-requests')
export class CreditRequestsController {
  constructor(private readonly creditRequestsService: CreditRequestsService) {}

  @Roles(Role.CONSULTOR, Role.ADMIN)
  @Post()
  create(@Body() dto: CreateCreditRequestDto, @CurrentUser() user: AuthUser) {
    return this.creditRequestsService.create(dto, user);
  }

  @Get()
  findAll(
    @Query() query: ListCreditRequestsQueryDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.creditRequestsService.findAll(
      user,
      query.page ?? 1,
      query.pageSize ?? 20,
      query.clientId,
      query.status,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.creditRequestsService.findOneForUser(id, user);
  }

  @Roles(Role.CONSULTOR, Role.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCreditRequestDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.creditRequestsService.update(id, dto, user);
  }

  @Roles(Role.CONSULTOR, Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<void> {
    return this.creditRequestsService.remove(id, user);
  }
}
