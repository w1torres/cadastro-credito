import { Injectable, NotFoundException } from '@nestjs/common';
import type { Document } from '@prisma/client';
import type { ReadStream } from 'node:fs';
import { PrismaService } from '../prisma/prisma.service.js';
import { StorageService } from '../storage/storage.service.js';
import { CreditRequestsService } from '../credit-requests/credit-requests.service.js';
import { recordAudit } from '../common/audit/record-audit.util.js';
import type { AuthUser } from '../auth/types/auth-user.type.js';
import { UploadDocumentDto } from './dto/upload-document.dto.js';

export interface UploadedFileInput {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly creditRequestsService: CreditRequestsService,
  ) {}

  async upload(
    creditRequestId: string,
    file: UploadedFileInput,
    dto: UploadDocumentDto,
    user: AuthUser,
  ): Promise<Document> {
    const creditRequest = await this.creditRequestsService.findOneForUser(
      creditRequestId,
      user,
    );
    this.creditRequestsService.assertEditable(creditRequest, user);

    const storageKey = this.storage.buildKey(
      `credit-requests/${creditRequestId}`,
      file.originalname,
    );
    await this.storage.save(storageKey, file.buffer);

    return this.prisma.$transaction(async (tx) => {
      const document = await tx.document.create({
        data: {
          creditRequestId,
          type: dto.type,
          originalName: file.originalname,
          storageKey,
          mimeType: file.mimetype,
          size: file.size,
          uploadedById: user.id,
        },
      });
      await recordAudit(tx, {
        userId: user.id,
        action: 'DOCUMENT_UPLOADED',
        entity: 'Document',
        entityId: document.id,
        metadata: { creditRequestId, type: dto.type },
      });
      return document;
    });
  }

  async listByCreditRequest(
    creditRequestId: string,
    user: AuthUser,
  ): Promise<Document[]> {
    await this.creditRequestsService.findOneForUser(creditRequestId, user);
    return this.prisma.document.findMany({
      where: { creditRequestId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async download(
    documentId: string,
    user: AuthUser,
  ): Promise<{ document: Document; stream: ReadStream }> {
    const document = await this.findOwned(documentId);
    await this.creditRequestsService.findOneForUser(
      document.creditRequestId,
      user,
    );
    return { document, stream: this.storage.readStream(document.storageKey) };
  }

  async remove(documentId: string, user: AuthUser): Promise<void> {
    const document = await this.findOwned(documentId);
    const creditRequest = await this.creditRequestsService.findOneForUser(
      document.creditRequestId,
      user,
    );
    this.creditRequestsService.assertEditable(creditRequest, user);

    await this.prisma.$transaction(async (tx) => {
      await tx.document.delete({ where: { id: documentId } });
      await recordAudit(tx, {
        userId: user.id,
        action: 'DOCUMENT_REMOVED',
        entity: 'Document',
        entityId: documentId,
        metadata: { creditRequestId: document.creditRequestId },
      });
    });
    await this.storage.delete(document.storageKey);
  }

  private async findOwned(documentId: string): Promise<Document> {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });
    if (!document) {
      throw new NotFoundException('Documento não encontrado.');
    }
    return document;
  }
}
