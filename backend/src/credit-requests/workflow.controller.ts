import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthUser } from '../auth/types/auth-user.type.js';
import { WorkflowService } from './workflow.service.js';
import { TransitionDto } from './dto/transition-base.dto.js';
import { ReturnCreditRequestDto } from './dto/return-credit-request.dto.js';
import { RejectCreditRequestDto } from './dto/reject-credit-request.dto.js';
import { CancelCreditRequestDto } from './dto/cancel-credit-request.dto.js';

@Controller('credit-requests')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Roles(Role.CONSULTOR, Role.GERENTE, Role.CREDITO, Role.ADMIN)
  @Post(':id/submit')
  submit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TransitionDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.workflowService.transition(id, 'SUBMIT', dto, user);
  }

  @Roles(Role.GERENTE, Role.CREDITO, Role.ADMIN)
  @Post(':id/return')
  return(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReturnCreditRequestDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.workflowService.transition(id, 'RETURN', dto, user);
  }

  @Roles(Role.CREDITO, Role.ADMIN)
  @Post(':id/approve')
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TransitionDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.workflowService.transition(id, 'APPROVE', dto, user);
  }

  @Roles(Role.CREDITO, Role.ADMIN)
  @Post(':id/reject')
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectCreditRequestDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.workflowService.transition(id, 'REJECT', dto, user);
  }

  @Roles(Role.CONSULTOR, Role.ADMIN)
  @Post(':id/cancel')
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelCreditRequestDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.workflowService.transition(id, 'CANCEL', dto, user);
  }

  @Get(':id/history')
  history(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.workflowService.getHistory(id, user);
  }
}
