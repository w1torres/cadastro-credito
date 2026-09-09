import { Module } from '@nestjs/common';
import { ClientsModule } from '../clients/clients.module.js';
import { CreditRequestsController } from './credit-requests.controller.js';
import { CreditRequestsService } from './credit-requests.service.js';
import { WorkflowController } from './workflow.controller.js';
import { WorkflowService } from './workflow.service.js';

@Module({
  imports: [ClientsModule],
  controllers: [CreditRequestsController, WorkflowController],
  providers: [CreditRequestsService, WorkflowService],
})
export class CreditRequestsModule {}
