import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import type { ReadStream } from 'node:fs';
import { dirname, join } from 'node:path';

/**
 * Abstração de armazenamento de arquivo (spec 05: "não armazenar arquivos
 * grandes diretamente no PostgreSQL... utilizar uma abstração StorageService").
 * MVP = disco local (ver ADR-016) — trocar por S3/MinIO no futuro é só
 * reimplementar esta classe, sem tocar em DocumentsService/SignaturesService.
 */
@Injectable()
export class StorageService {
  private readonly baseDir: string;

  constructor(configService: ConfigService) {
    this.baseDir =
      configService.get<string>('STORAGE_DIR') ??
      join(process.cwd(), 'storage');
  }

  /** Gera uma chave única e estável para um novo arquivo dentro do escopo informado (ex.: `credit-requests/<id>`). */
  buildKey(scope: string, originalName: string): string {
    const sanitized = originalName.replace(/[^a-zA-Z0-9._-]+/g, '_');
    return `${scope}/${randomUUID()}-${sanitized}`;
  }

  async save(key: string, buffer: Buffer): Promise<void> {
    const fullPath = this.resolve(key);
    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, buffer);
  }

  readStream(key: string): ReadStream {
    return createReadStream(this.resolve(key));
  }

  /** Usado pelo SignaturesService: a API da Clicksign espera o conteúdo do documento em base64 no corpo da requisição, não um stream. */
  async readBuffer(key: string): Promise<Buffer> {
    return readFile(this.resolve(key));
  }

  async delete(key: string): Promise<void> {
    await rm(this.resolve(key), { force: true });
  }

  private resolve(key: string): string {
    return join(this.baseDir, key);
  }
}
