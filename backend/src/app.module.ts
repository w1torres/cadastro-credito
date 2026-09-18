import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { HealthModule } from './health/health.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { ClientsModule } from './clients/clients.module.js';
import { PropertiesModule } from './properties/properties.module.js';
import { CreditRequestsModule } from './credit-requests/credit-requests.module.js';
import { BranchesModule } from './branches/branches.module.js';
import { DocumentsModule } from './documents/documents.module.js';
import { SignaturesModule } from './signatures/signatures.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../.env', '.env'],
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    ClientsModule,
    PropertiesModule,
    CreditRequestsModule,
    BranchesModule,
    DocumentsModule,
    SignaturesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
