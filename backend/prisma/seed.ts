import { readFileSync } from 'node:fs';
import path from 'node:path';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();


/**
 * Usuários de teste locais. Cada pessoa real entra pelo próprio login Microsoft
 * (Entra ID) quando o e-mail corporativo estiver cadastrado; aqui o e-mail é
 * local (…@teste.local) e o acesso é pelo login de desenvolvimento (AUTH_DEV_LOGIN).
 *
 * Perfil e filial são deduzidos do código: GE = GERENTE, RC = CONSULTOR;
 * os dois dígitos depois das letras indicam a filial (ex.: RC0202 -> 02-TCHE LZA).
 */
const USUARIOS_DEMO_FIXOS: Array<{ name: string; email: string; role: Role }> = [
  { name: 'Gerente de Crédito Demo', email: 'credito@example.com', role: Role.CREDITO },
  { name: 'Admin Demo', email: 'admin@example.com', role: Role.ADMIN },
];

function slugify(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
}

function lerTsv(arquivo: string): string[][] {
  const caminho = path.join(process.cwd(), 'prisma', 'data', arquivo);
  return readFileSync(caminho, 'utf8')
    .split(/\r?\n/)
    .filter((linha) => linha.trim().length > 0)
    .map((linha) => linha.split('\t').map((campo) => campo.trim()));
}

async function main(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Seed de dados de desenvolvimento não deve rodar em produção.');
  }

  // 1. Filiais: número do código (01, 02, …) -> nome (data/filiais.tsv)
  const filiais = lerTsv('filiais.tsv');
  for (const [, nome] of filiais) {
    await prisma.branch.upsert({ where: { name: nome }, update: {}, create: { name: nome } });
  }
  const filialPorNumero = new Map<string, { id: string; name: string }>();
  for (const [numero, nome] of filiais) {
    const filial = await prisma.branch.findUniqueOrThrow({ where: { name: nome } });
    filialPorNumero.set(numero.padStart(2, '0'), filial);
  }

  // 2. Usuários demo fixos (CREDITO e ADMIN não pertencem a filial)
  for (const usuario of USUARIOS_DEMO_FIXOS) {
    await prisma.user.upsert({
      where: { email: usuario.email },
      update: { name: usuario.name, role: usuario.role, isActive: true },
      create: { ...usuario, isActive: true },
    });
  }

  // 3. Usuários da lista (nome <TAB> código)
  let criados = 0;
  const semCodigo: string[] = [];
  const semFilial: string[] = [];
  for (const [nome, codigo] of lerTsv('usuarios.tsv')) {
    if (!codigo) {
      semCodigo.push(nome);
      continue;
    }
    const codigoUpper = codigo.toUpperCase();
    const role = codigoUpper.startsWith('GE') ? Role.GERENTE : Role.CONSULTOR;
    const filial = filialPorNumero.get(codigoUpper.slice(2, 4));
    if (!filial) semFilial.push(`${codigo} ${nome}`);

    const email = `${codigoUpper.toLowerCase()}.${slugify(nome)}@teste.local`;
    await prisma.user.upsert({
      where: { email },
      update: { name: nome, role, codigo: codigoUpper, branchId: filial?.id ?? null, isActive: true },
      create: { name: nome, email, role, codigo: codigoUpper, branchId: filial?.id ?? null, isActive: true },
    });
    criados += 1;
  }

  console.log(`Filiais: ${filiais.length}. Usuários de teste: ${criados}.`);
  if (semCodigo.length) console.log(`Sem código (não cadastrados): ${semCodigo.join(', ')}`);
  if (semFilial.length) console.log(`Sem filial correspondente: ${semFilial.join('; ')}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
