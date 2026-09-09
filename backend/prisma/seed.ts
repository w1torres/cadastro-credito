import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SEED_PASSWORD = 'Senha@123';

const SEED_USERS: Array<{ name: string; email: string; role: Role }> = [
  { name: 'Consultor Demo', email: 'consultor@example.com', role: Role.CONSULTOR },
  { name: 'Gerente Demo', email: 'gerente@example.com', role: Role.GERENTE },
  { name: 'Crédito Demo', email: 'credito@example.com', role: Role.CREDITO },
  { name: 'Admin Demo', email: 'admin@example.com', role: Role.ADMIN },
];

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

  console.log(`Usuários de desenvolvimento criados/atualizados. Senha padrão: "${SEED_PASSWORD}".`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
