import { Module } from '@nestjs/common';
import { ClientsController } from './clients.controller.js';
import { ClientsService } from './clients.service.js';
import { PartnersController } from './partners.controller.js';
import { PartnersService } from './partners.service.js';

@Module({
  controllers: [ClientsController, PartnersController],
  providers: [ClientsService, PartnersService],
  exports: [ClientsService],
})
export class ClientsModule {}
