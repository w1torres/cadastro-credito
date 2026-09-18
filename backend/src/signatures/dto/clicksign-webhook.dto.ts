/**
 * Formato observado nos exemplos públicos de webhook da Clicksign (evento
 * dentro de `event`, envelope dentro de `data`). AJUSTAR conforme o payload
 * real recebido no sandbox durante a verificação manual (ver aviso em
 * clicksign-adapter.ts) — não há schema oficial completo confirmado.
 */
export interface ClicksignWebhookPayload {
  event?: {
    name?: string;
    data?: {
      id?: string;
    };
  };
  data?: {
    id?: string;
    attributes?: {
      key?: string;
    };
  };
}

export interface ParsedClicksignWebhookEvent {
  eventId: string;
  eventType: string;
  envelopeId: string;
}

/**
 * Extrai id do evento / tipo do evento / id do envelope de formas plausíveis
 * do payload — lança erro claro se nenhuma bater, em vez de silenciosamente
 * ignorar um formato não previsto.
 */
export function parseClicksignWebhookPayload(
  body: ClicksignWebhookPayload,
): ParsedClicksignWebhookEvent {
  const eventType = body.event?.name;
  const envelopeId = body.event?.data?.id ?? body.data?.id;
  const eventId = body.data?.attributes?.key ?? body.data?.id;

  if (!eventType || !envelopeId || !eventId) {
    throw new Error(
      'Payload de webhook da Clicksign em formato inesperado — ajustar parseClicksignWebhookPayload conforme o payload real recebido.',
    );
  }

  return { eventId, eventType, envelopeId };
}
