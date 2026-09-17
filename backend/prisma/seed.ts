import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SEED_PASSWORD = 'Senha@123';

const SEED_USERS: Array<{ name: string; email: string; role: Role }> = [
  { name: 'Consultor Demo', email: 'consultor@example.com', role: Role.CONSULTOR },
  { name: 'Gerente Comercial Demo', email: 'gerente@example.com', role: Role.GERENTE },
  { name: 'Gerente de Crédito Demo', email: 'credito@example.com', role: Role.CREDITO },
  { name: 'Admin Demo', email: 'admin@example.com', role: Role.ADMIN },
];

const BRANCH_NAMES = [
  'Formosa',
  'Luziânia',
  'Buritis',
  'Padre Bernardo',
  'Cristalina',
  'Vianópolis',
  'Uruaçu',
  'Catalão',
  'Paracatu',
  'Palmeiras de Goiás',
  'Guarda-Mor',
];

function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove diacritics (á -> a, ã -> a, ç -> c...)
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
}

async function main(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Seed de dados de desenvolvimento não deve rodar em produção.');
  }

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  for (const seedUser of SEED_USERS) {
    await prisma.user.upsert({
      where: { email: seedUser.email },
      update: {},
      create: { ...seedUser, passwordHash },
    });
  }

  for (const branchName of BRANCH_NAMES) {
    const branch = await prisma.branch.upsert({
      where: { name: branchName },
      update: {},
      create: { name: branchName },
    });

    const slug = slugify(branchName);

    await prisma.user.upsert({
      where: { email: `gerente.${slug}@example.com` },
      update: { branchId: branch.id },
      create: {
        name: `Gerente ${branchName}`,
        email: `gerente.${slug}@example.com`,
        role: Role.GERENTE,
        branchId: branch.id,
        passwordHash,
      },
    });

    for (const seq of [1, 2]) {
      await prisma.user.upsert({
        where: { email: `consultor${seq}.${slug}@example.com` },
        update: { branchId: branch.id },
        create: {
          name: `Consultor ${seq} ${branchName}`,
          email: `consultor${seq}.${slug}@example.com`,
          role: Role.CONSULTOR,
          branchId: branch.id,
          passwordHash,
        },
      });
    }
  }

  console.log(
    `Usuários de desenvolvimento criados/atualizados (incluindo ${BRANCH_NAMES.length} filiais, com 1 gerente e 2 consultores cada). Senha padrão: "${SEED_PASSWORD}".`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
