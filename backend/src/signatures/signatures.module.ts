import { Module } from '@nestjs/common';
import { CreditRequestsModule } from '../credit-requests/credit-requests.module.js';
import { DocumentsModule } from '../documents/documents.module.js';
import { StorageModule } from '../storage/storage.module.js';
import { ClicksignAdapter } from './clicksign/clicksign-adapter.js';
import { SignaturesController } from './signatures.controller.js';
import { SignaturesService } from './signatures.service.js';

@Module({
  imports: [CreditRequestsModule, DocumentsModule, StorageModule],
  controllers: [SignaturesController],
  providers: [SignaturesService, ClicksignAdapter],
})
export class SignaturesModule {}
