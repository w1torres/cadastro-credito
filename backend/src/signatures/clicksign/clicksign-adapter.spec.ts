import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ClicksignAdapter } from './clicksign-adapter.js';

describe('ClicksignAdapter', () => {
  let adapter: ClicksignAdapter;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: () =>
        Promise.resolve({
          data: { id: 'envelope-1', attributes: { status: 'draft' } },
        }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const moduleRef = await Test.createTestingModule({
      providers: [
        ClicksignAdapter,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              key === 'CLICKSIGN_ENV' ? 'sandbox' : undefined,
            getOrThrow: () => 'fake-token',
          },
        },
      ],
    }).compile();

    adapter = moduleRef.get(ClicksignAdapter);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('formats documentationDigits as 000.000.000-00 before sending to Clicksign', async () => {
    await adapter.addSigner('envelope-1', {
      name: 'Fulano',
      email: 'fulano@example.com',
      documentationDigits: '12345678900',
    });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string) as {
      data: { attributes: { documentation: string } };
    };
    expect(body.data.attributes.documentation).toBe('123.456.789-00');
  });

  it('sends the sandbox base URL and the raw token in the Authorization header', async () => {
    await adapter.createEnvelope('Teste');

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://sandbox.clicksign.com/api/v3/envelopes');
    expect((init.headers as Record<string, string>).Authorization).toBe(
      'fake-token',
    );
  });
});
