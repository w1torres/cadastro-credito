import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module.js';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

interface LoginResponseBody {
  accessToken: string;
}

interface ClientResponseBody {
  id: string;
  consultantId: string;
}

interface ClientsListResponseBody {
  data: Array<{ id: string }>;
}

/**
 * Smoke e2e da Fase 2: login -> criação de cliente -> listagem, contra o
 * Postgres de desenvolvimento (migrado). Dados próprios com sufixo único e
 * teardown em afterAll — isolamento completo de banco de teste fica para a
 * Fase 7 (ver plano Fase 2, seção de Testing).
 */
describe('Auth + Clients (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const password = 'Senha@123';
  // Combina timestamp + aleatoriedade para nunca colidir com o suffix de
  // outro arquivo de e2e-spec carregado no mesmo milissegundo pelo Vitest.
  const suffix = `${Date.now()}${Math.floor(Math.random() * 900 + 100)}`.slice(
    -11,
  );
  const email = `e2e-consultor-${suffix}@example.com`;

  let userId: string;
  let clientId: string | undefined;
  let accessToken: string;

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
    const user = await prisma.user.create({
      data: { name: 'E2E Consultor', email, passwordHash, role: 'CONSULTOR' },
    });
    userId = user.id;
  });

  afterAll(async () => {
    if (clientId) {
      await prisma.client
        .delete({ where: { id: clientId } })
        .catch(() => undefined);
    }
    await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
    await app.close();
  });

  it('rejects login with a wrong password', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password: 'senha-errada' })
      .expect(401);
  });

  it('logs in with the seeded credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200);

    const body = response.body as LoginResponseBody;
    expect(typeof body.accessToken).toBe('string');
    accessToken = body.accessToken;
  });

  it('creates a client scoped to the authenticated consultant', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/clients')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Cliente E2E',
        document: suffix.padStart(11, '0'),
        phone: '55999999999',
        email: 'cliente-e2e@example.com',
        address: 'Rua Teste, 1',
        city: 'Cidade Teste',
        state: 'RS',
        zipCode: '90000-000',
        hasEasyRegistrationInfo: true,
        timeInBusiness: 'MORE_THAN_10_YEARS',
        hasCommercialReference: false,
      })
      .expect(201);

    const body = response.body as ClientResponseBody;
    clientId = body.id;
    expect(body.consultantId).toBe(userId);
  });

  it('lists the created client back for the same consultant', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/clients')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const body = response.body as ClientsListResponseBody;
    const ids = body.data.map((c) => c.id);
    expect(ids).toContain(clientId);
  });
});
