import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module.js';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

interface CreditRequestBody {
  id: string;
  status: string;
  updatedAt: string;
}

interface HistoryEntry {
  fromStatus: string | null;
  toStatus: string;
  reason: string | null;
}

/**
 * Smoke e2e da Fase 3: caminho feliz completo do workflow (submit -> approve),
 * um retorno simples (GERENTE -> CONSULTOR), um retorno pulando etapa
 * (CRÉDITO -> CONSULTOR direto) e os erros de permissão/concorrência/motivo.
 * Mesmo padrão de `auth-clients.e2e-spec.ts`: dados com sufixo único, contra
 * o Postgres de dev, com teardown em afterAll.
 */
describe('Workflow (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const password = 'Senha@123';
  // Combina timestamp + aleatoriedade para nunca colidir com o suffix de
  // outro arquivo de e2e-spec carregado no mesmo milissegundo pelo Vitest.
  const suffix = `${Date.now()}${Math.floor(Math.random() * 900 + 100)}`.slice(
    -11,
  );

  let consultorId: string;
  let gerenteId: string;
  let creditoId: string;
  let consultorToken: string;
  let gerenteToken: string;
  let creditoToken: string;

  let clientId: string;
  let propertyId: string | undefined;
  let creditRequestId: string;
  let updatedAt: string;

  async function loginAs(email: string): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200);
    return (response.body as { accessToken: string }).accessToken;
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api', { exclude: ['health'] });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    prisma = app.get(PrismaService);

    const passwordHash = await bcrypt.hash(password, 4);
    const [consultor, gerente, credito] = await Promise.all([
      prisma.user.create({
        data: {
          name: 'E2E Consultor WF',
          email: `e2e-wf-consultor-${suffix}@example.com`,
          passwordHash,
          role: 'CONSULTOR',
        },
      }),
      prisma.user.create({
        data: {
          name: 'E2E Gerente WF',
          email: `e2e-wf-gerente-${suffix}@example.com`,
          passwordHash,
          role: 'GERENTE',
        },
      }),
      prisma.user.create({
        data: {
          name: 'E2E Credito WF',
          email: `e2e-wf-credito-${suffix}@example.com`,
          passwordHash,
          role: 'CREDITO',
        },
      }),
    ]);
    consultorId = consultor.id;
    gerenteId = gerente.id;
    creditoId = credito.id;

    consultorToken = await loginAs(consultor.email);
    gerenteToken = await loginAs(gerente.email);
    creditoToken = await loginAs(credito.email);

    const clientResponse = await request(app.getHttpServer())
      .post('/api/clients')
      .set('Authorization', `Bearer ${consultorToken}`)
      .send({
        name: 'Cliente E2E Workflow',
        document: suffix.padStart(11, '1'),
        phone: '55999999999',
        email: 'cliente-e2e-wf@example.com',
        address: 'Rua Teste, 1',
        city: 'Cidade Teste',
        state: 'RS',
        zipCode: '90000-000',
        hasEasyRegistrationInfo: true,
        timeInBusiness: 'MORE_THAN_10_YEARS',
        hasCommercialReference: false,
      })
      .expect(201);
    clientId = (clientResponse.body as { id: string }).id;

    const creditRequestResponse = await request(app.getHttpServer())
      .post('/api/credit-requests')
      .set('Authorization', `Bearer ${consultorToken}`)
      .send({
        clientId,
        requestedCreditLimit: '50000.00',
        leasedAreaPlanting: false,
        firstHarvestAreaPlanting: false,
        barterModality: false,
        hasRenegotiatedDebts: false,
        landAcquisition: false,
        newMachineryAcquisition: false,
        otherActivity: false,
      })
      .expect(201);
    const created = creditRequestResponse.body as CreditRequestBody;
    creditRequestId = created.id;
    updatedAt = created.updatedAt;
  });

  afterAll(async () => {
    await prisma.creditRequestHistory
      .deleteMany({ where: { creditRequestId } })
      .catch(() => undefined);
    await prisma.auditLog
      .deleteMany({ where: { entityId: creditRequestId } })
      .catch(() => undefined);
    await prisma.creditRequest
      .delete({ where: { id: creditRequestId } })
      .catch(() => undefined);
    if (propertyId) {
      await prisma.property
        .delete({ where: { id: propertyId } })
        .catch(() => undefined);
    }
    await prisma.client
      .delete({ where: { id: clientId } })
      .catch(() => undefined);
    await prisma.user
      .deleteMany({
        where: { id: { in: [consultorId, gerenteId, creditoId] } },
      })
      .catch(() => undefined);
    await app.close();
  });

  it('blocks SUBMIT from DRAFT while the client has no registered property', async () => {
    await request(app.getHttpServer())
      .post(`/api/credit-requests/${creditRequestId}/submit`)
      .set('Authorization', `Bearer ${consultorToken}`)
      .send({ expectedUpdatedAt: updatedAt })
      .expect(409);
  });

  it('registers a property so the credit request can be submitted', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/properties')
      .set('Authorization', `Bearer ${consultorToken}`)
      .send({
        clientId,
        name: 'Fazenda E2E',
        city: 'Cidade Teste',
        state: 'RS',
        region: 'Sul',
        ownAreaHectares: '100.00',
        leasedAreaHectares: '0.00',
        irrigatedAreaHectares: '0.00',
      })
      .expect(201);
    propertyId = (response.body as { id: string }).id;
  });

  it('submits the DRAFT to the manager (CONSULTOR)', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/credit-requests/${creditRequestId}/submit`)
      .set('Authorization', `Bearer ${consultorToken}`)
      .send({ expectedUpdatedAt: updatedAt })
      .expect(201);
    const body = response.body as CreditRequestBody;
    expect(body.status).toBe('SUBMITTED_TO_MANAGER');
    updatedAt = body.updatedAt;
  });

  it('rejects a CONSULTOR trying to approve (403)', async () => {
    await request(app.getHttpServer())
      .post(`/api/credit-requests/${creditRequestId}/approve`)
      .set('Authorization', `Bearer ${consultorToken}`)
      .send({ expectedUpdatedAt: updatedAt })
      .expect(403);
  });

  it('lets the GERENTE claim the request for review', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/credit-requests/${creditRequestId}/submit`)
      .set('Authorization', `Bearer ${gerenteToken}`)
      .send({ expectedUpdatedAt: updatedAt })
      .expect(201);
    const body = response.body as CreditRequestBody;
    expect(body.status).toBe('MANAGER_REVIEW');
    updatedAt = body.updatedAt;
  });

  it('rejects a RETURN without a reason (400)', async () => {
    await request(app.getHttpServer())
      .post(`/api/credit-requests/${creditRequestId}/return`)
      .set('Authorization', `Bearer ${gerenteToken}`)
      .send({ expectedUpdatedAt: updatedAt })
      .expect(400);
  });

  it('detects a stale expectedUpdatedAt (409)', async () => {
    await request(app.getHttpServer())
      .post(`/api/credit-requests/${creditRequestId}/return`)
      .set('Authorization', `Bearer ${gerenteToken}`)
      .send({
        expectedUpdatedAt: new Date('2020-01-01').toISOString(),
        reason: 'qualquer motivo',
      })
      .expect(409);
  });

  it('lets the GERENTE return the request to the consultant with a reason', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/credit-requests/${creditRequestId}/return`)
      .set('Authorization', `Bearer ${gerenteToken}`)
      .send({
        expectedUpdatedAt: updatedAt,
        reason: 'Faltam informações no formulário.',
      })
      .expect(201);
    const body = response.body as CreditRequestBody;
    expect(body.status).toBe('RETURNED_TO_CONSULTANT');
    updatedAt = body.updatedAt;
  });

  it('lets the consultant resubmit after a correction', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/credit-requests/${creditRequestId}/submit`)
      .set('Authorization', `Bearer ${consultorToken}`)
      .send({ expectedUpdatedAt: updatedAt })
      .expect(201);
    const body = response.body as CreditRequestBody;
    expect(body.status).toBe('SUBMITTED_TO_MANAGER');
    updatedAt = body.updatedAt;
  });

  it('walks the request through MANAGER_REVIEW, SUBMITTED_TO_CREDIT and CREDIT_REVIEW', async () => {
    let response = await request(app.getHttpServer())
      .post(`/api/credit-requests/${creditRequestId}/submit`)
      .set('Authorization', `Bearer ${gerenteToken}`)
      .send({ expectedUpdatedAt: updatedAt })
      .expect(201);
    updatedAt = (response.body as CreditRequestBody).updatedAt;

    response = await request(app.getHttpServer())
      .post(`/api/credit-requests/${creditRequestId}/submit`)
      .set('Authorization', `Bearer ${gerenteToken}`)
      .send({ expectedUpdatedAt: updatedAt })
      .expect(201);
    expect((response.body as CreditRequestBody).status).toBe(
      'SUBMITTED_TO_CREDIT',
    );
    updatedAt = (response.body as CreditRequestBody).updatedAt;

    response = await request(app.getHttpServer())
      .post(`/api/credit-requests/${creditRequestId}/submit`)
      .set('Authorization', `Bearer ${creditoToken}`)
      .send({ expectedUpdatedAt: updatedAt })
      .expect(201);
    expect((response.body as CreditRequestBody).status).toBe('CREDIT_REVIEW');
    updatedAt = (response.body as CreditRequestBody).updatedAt;
  });

  it('requires targetStatus when CREDITO returns from CREDIT_REVIEW (ambiguous destination)', async () => {
    await request(app.getHttpServer())
      .post(`/api/credit-requests/${creditRequestId}/return`)
      .set('Authorization', `Bearer ${creditoToken}`)
      .send({
        expectedUpdatedAt: updatedAt,
        reason: 'Documento do cliente pendente.',
      })
      .expect(400);
  });

  it('lets CREDITO skip the GERENTE and return straight to the CONSULTANT', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/credit-requests/${creditRequestId}/return`)
      .set('Authorization', `Bearer ${creditoToken}`)
      .send({
        expectedUpdatedAt: updatedAt,
        reason: 'Documento do cliente pendente.',
        targetStatus: 'RETURNED_TO_CONSULTANT',
      })
      .expect(201);
    const body = response.body as CreditRequestBody;
    expect(body.status).toBe('RETURNED_TO_CONSULTANT');
    updatedAt = body.updatedAt;
  });

  it('walks the request back to CREDIT_REVIEW and approves it', async () => {
    const steps: Array<[string, string]> = [
      [consultorToken, 'SUBMITTED_TO_MANAGER'],
      [gerenteToken, 'MANAGER_REVIEW'],
      [gerenteToken, 'SUBMITTED_TO_CREDIT'],
      [creditoToken, 'CREDIT_REVIEW'],
    ];
    for (const [token, expectedStatus] of steps) {
      const response = await request(app.getHttpServer())
        .post(`/api/credit-requests/${creditRequestId}/submit`)
        .set('Authorization', `Bearer ${token}`)
        .send({ expectedUpdatedAt: updatedAt })
        .expect(201);
      const body = response.body as CreditRequestBody;
      expect(body.status).toBe(expectedStatus);
      updatedAt = body.updatedAt;
    }

    const approveResponse = await request(app.getHttpServer())
      .post(`/api/credit-requests/${creditRequestId}/approve`)
      .set('Authorization', `Bearer ${creditoToken}`)
      .send({ expectedUpdatedAt: updatedAt })
      .expect(201);
    const body = approveResponse.body as CreditRequestBody;
    expect(body.status).toBe('APPROVED');
    updatedAt = body.updatedAt;
  });

  it('rejects approving an already-APPROVED request (invalid transition)', async () => {
    await request(app.getHttpServer())
      .post(`/api/credit-requests/${creditRequestId}/approve`)
      .set('Authorization', `Bearer ${creditoToken}`)
      .send({ expectedUpdatedAt: updatedAt })
      .expect(409);
  });

  it('returns the full ordered history timeline', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/credit-requests/${creditRequestId}/history`)
      .set('Authorization', `Bearer ${consultorToken}`)
      .expect(200);

    const history = response.body as HistoryEntry[];
    const toStatuses = history.map((entry) => entry.toStatus);
    expect(toStatuses).toEqual([
      'DRAFT',
      'SUBMITTED_TO_MANAGER',
      'MANAGER_REVIEW',
      'RETURNED_TO_CONSULTANT',
      'SUBMITTED_TO_MANAGER',
      'MANAGER_REVIEW',
      'SUBMITTED_TO_CREDIT',
      'CREDIT_REVIEW',
      'RETURNED_TO_CONSULTANT',
      'SUBMITTED_TO_MANAGER',
      'MANAGER_REVIEW',
      'SUBMITTED_TO_CREDIT',
      'CREDIT_REVIEW',
      'APPROVED',
    ]);
    expect(
      history.find(
        (entry) =>
          entry.toStatus === 'RETURNED_TO_CONSULTANT' &&
          entry.fromStatus === 'CREDIT_REVIEW',
      )?.reason,
    ).toBe('Documento do cliente pendente.');
  });
});
