import { Module } from '@nestjs/common';
import { ClientsModule } from '../clients/clients.module.js';
import { PropertiesController } from './properties.controller.js';
import { PropertiesService } from './properties.service.js';
import { ProductionController } from './production.controller.js';
import { ProductionService } from './production.service.js';

@Module({
  imports: [ClientsModule],
  controllers: [PropertiesController, ProductionController],
  providers: [PropertiesService, ProductionService],
  exports: [PropertiesService],
})
export class PropertiesModule {}
