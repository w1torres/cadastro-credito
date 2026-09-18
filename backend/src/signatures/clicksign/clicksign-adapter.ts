import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ClicksignSignerInput {
  name: string;
  email: string;
  /** Apenas os 11 dígitos do CPF — este adapter formata para "000.000.000-00" (formato exigido pela Clicksign) antes de enviar. */
  documentationDigits: string;
}

export interface ClicksignDocumentInput {
  filename: string;
  contentBase64: string;
}

export interface ClicksignEnvelope {
  id: string;
  status: string;
}

/**
 * Isola a API da Clicksign do resto do domínio (spec 07 / ADR-006) — nada
 * fora deste arquivo conhece o formato JSON:API da Clicksign.
 *
 * Arquitetura confirmada na documentação oficial (developers.clicksign.com)
 * em 2026-09: API v3, JSON:API (`application/vnd.api+json`), autenticação
 * pelo header `Authorization: <access_token>` (token puro, não "Bearer"),
 * `POST /api/v3/envelopes` cria o envelope; documentos e signatários são
 * sub-recursos adicionados depois, não no mesmo payload.
 *
 * IMPORTANTE: os endpoints/payloads exatos de "adicionar documento" e
 * "adicionar signatário" abaixo (`/envelopes/:id/documents`,
 * `/envelopes/:id/signers`) seguem o padrão geral de relacionamento da v3,
 * mas não puderam ser confirmados campo-a-campo contra a referência ao vivo
 * durante esta implementação (páginas públicas sem o schema completo no
 * momento da consulta). Antes de usar em produção: testar contra o sandbox
 * (`CLICKSIGN_ENV=sandbox`) e ajustar aqui conforme a resposta real da API —
 * é exatamente para isso que a integração fica isolada neste único arquivo.
 */
@Injectable()
export class ClicksignAdapter {
  constructor(private readonly configService: ConfigService) {}

  async createEnvelope(name: string): Promise<ClicksignEnvelope> {
    const result = await this.request<{
      data: { id: string; attributes: { status: string } };
    }>('/api/v3/envelopes', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'envelopes',
          attributes: { name, locale: 'pt-BR', auto_close: true },
        },
      }),
    });
    return { id: result.data.id, status: result.data.attributes.status };
  }

  async addDocument(
    envelopeId: string,
    document: ClicksignDocumentInput,
  ): Promise<void> {
    await this.request(`/api/v3/envelopes/${envelopeId}/documents`, {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'documents',
          attributes: {
            filename: document.filename,
            content_base64: document.contentBase64,
          },
        },
      }),
    });
  }

  async addSigner(
    envelopeId: string,
    signer: ClicksignSignerInput,
  ): Promise<void> {
    // Formato confirmado na referência oficial (developers.clicksign.com/reference/api-criar-signatario):
    // "documentation: CPF formatted 000.000.000-00" — enviar dígitos crus (ou um CNPJ) é rejeitado com 422.
    const documentation = signer.documentationDigits.replace(
      /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
      '$1.$2.$3-$4',
    );
    await this.request(`/api/v3/envelopes/${envelopeId}/signers`, {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'signers',
          attributes: {
            name: signer.name,
            email: signer.email,
            documentation,
          },
        },
      }),
    });
  }

  async activate(envelopeId: string): Promise<void> {
    await this.request(`/api/v3/envelopes/${envelopeId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        data: {
          id: envelopeId,
          type: 'envelopes',
          attributes: { status: 'running' },
        },
      }),
    });
  }

  private baseUrl(): string {
    const env = this.configService.get<string>('CLICKSIGN_ENV') ?? 'sandbox';
    return env === 'production'
      ? 'https://app.clicksign.com'
      : 'https://sandbox.clicksign.com';
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const token = this.configService.getOrThrow<string>('CLICKSIGN-TOKEN-API');
    const response = await fetch(`${this.baseUrl()}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/vnd.api+json',
        Accept: 'application/vnd.api+json',
        Authorization: token,
        ...init.headers,
      },
    });
    if (!response.ok) {
      // Nunca logar o token — só status e corpo de erro da Clicksign (spec 07: "registrar erros sem vazar secrets").
      const body = await response.text().catch(() => '');
      throw new Error(`Clicksign API respondeu ${response.status}: ${body}`);
    }
    if (response.status === 204) {
      return undefined as T;
    }
    return (await response.json()) as T;
  }
}
