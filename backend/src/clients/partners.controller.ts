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
import { PartnersService } from './partners.service.js';
import { CreatePartnerDto } from './dto/create-partner.dto.js';
import { UpdatePartnerDto } from './dto/update-partner.dto.js';

@Roles(Role.CONSULTOR, Role.ADMIN)
@Controller()
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Post('clients/:clientId/partners')
  create(
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Body() dto: CreatePartnerDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.partnersService.create(clientId, dto, user);
  }

  @Patch('partners/:id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePartnerDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.partnersService.update(id, dto, user);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('partners/:id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<void> {
    return this.partnersService.remove(id, user);
  }
}
