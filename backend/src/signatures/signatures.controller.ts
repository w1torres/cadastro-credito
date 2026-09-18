import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Logger,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { Public } from '../auth/decorators/public.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthUser } from '../auth/types/auth-user.type.js';
import { SignaturesService } from './signatures.service.js';
import { parseClicksignWebhookPayload } from './dto/clicksign-webhook.dto.js';
import type { ClicksignWebhookPayload } from './dto/clicksign-webhook.dto.js';

@Controller()
export class SignaturesController {
  private readonly logger = new Logger(SignaturesController.name);

  constructor(
    private readonly signaturesService: SignaturesService,
    private readonly configService: ConfigService,
  ) {}

  @Post('credit-requests/:id/request-signature')
  requestSignature(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.signaturesService.requestSignature(id, user);
  }

  @Get('credit-requests/:id/signature')
  getStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.signaturesService.getStatus(id, user);
  }

  /**
   * Rota pública (spec 07: sem autenticação de usuário) mas nunca aberta de
   * verdade — validada pelo HMAC-SHA256 no header `Content-Hmac`
   * (`sha256=<hash>`) sobre o corpo cru, exatamente como a Clicksign exige
   * ("não formatar o JSON antes de calcular o hash" — daí `req.rawBody`,
   * habilitado em main.ts, em vez do `body` já parseado).
   */
  @Public()
  @Post('webhooks/clicksign')
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Body() body: ClicksignWebhookPayload,
    @Headers('content-hmac') signatureHeader: string | undefined,
  ): Promise<{ received: boolean }> {
    this.verifySignature(req.rawBody, signatureHeader);

    let parsed;
    try {
      parsed = parseClicksignWebhookPayload(body);
    } catch (err) {
      // Erro de formato de payload não deve vazar detalhe nenhum — só loga
      // localmente (spec 07: "registrar erros sem vazar secrets") e responde 400.
      this.logger.error((err as Error).message);
      throw new BadRequestException('Payload de webhook inválido.');
    }

    await this.signaturesService.handleWebhookEvent(
      parsed.eventId,
      parsed.eventType,
      parsed.envelopeId,
      body,
    );
    return { received: true };
  }

  private verifySignature(
    rawBody: Buffer | undefined,
    signatureHeader: string | undefined,
  ): void {
    const secret = this.configService.get<string>('CLICKSIGN_WEBHOOK_SECRET');
    if (!secret) {
      throw new UnauthorizedException(
        'Webhook da Clicksign não configurado neste ambiente.',
      );
    }
    if (!rawBody || !signatureHeader) {
      throw new UnauthorizedException('Assinatura do webhook ausente.');
    }

    const expected = `sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`;
    const expectedBuffer = Buffer.from(expected);
    const receivedBuffer = Buffer.from(signatureHeader);

    const valid =
      expectedBuffer.length === receivedBuffer.length &&
      timingSafeEqual(expectedBuffer, receivedBuffer);
    if (!valid) {
      throw new UnauthorizedException('Assinatura do webhook inválida.');
    }
  }
}
