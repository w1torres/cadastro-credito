# Sistema de Solicitação e Análise de Crédito Rural

Monorepo (npm workspaces) contendo o backend (NestJS + Prisma + PostgreSQL) e o frontend (Vite + React + TypeScript) da aplicação de gestão de solicitação e análise de crédito rural.

As especificações completas do projeto estão em [`especificacoes_sistema_credito_rural/`](./especificacoes_sistema_credito_rural) e devem ser lidas antes de qualquer alteração — ver também [`CLAUDE.md`](./CLAUDE.md).

Este README cobre apenas a Fase 1 (Fundação): estrutura de monorepo, TypeScript, lint/format, Docker Compose com PostgreSQL e Prisma. Nenhuma entidade de domínio (clientes, propriedades, solicitações de crédito, workflow) foi implementada ainda — isso é escopo das fases seguintes.

## Estrutura

```
/backend         aplicação NestJS + Prisma (API)
/frontend        aplicação Vite + React + TypeScript (SPA)
/docs            auditoria e requisitos (Fase 0)
/especificacoes_sistema_credito_rural   especificações do sistema (ADRs, fases, domínio, etc.)
docker-compose.yml   serviço PostgreSQL para desenvolvimento local
.env.example         variáveis de ambiente necessárias
```

## Pré-requisitos

- Node.js 24+ e npm 11+
- Docker Desktop com Docker Compose v2

## Como rodar

### 1. Variáveis de ambiente

Copie o arquivo de exemplo da raiz e ajuste se necessário:

```bash
cp .env.example .env
```

O backend também lê um `.env` local em `backend/.env` (usado pelo Prisma CLI, que resolve variáveis relativas ao diretório do workspace). Mantenha os valores de `DATABASE_URL` sincronizados entre `.env` (raiz) e `backend/.env`.

### 2. Subir o PostgreSQL

```bash
docker compose up -d
```

Isso sobe um container `postgres:16-alpine` expondo a porta `5433` do host (configurável via `POSTGRES_PORT`; usamos 5433 por padrão em vez de 5432 porque é comum já haver um PostgreSQL nativo instalado na máquina do desenvolvedor ocupando a porta padrão), com um volume nomeado para persistência dos dados.

Para derrubar:

```bash
docker compose down
```

### 3. Instalar dependências

Na raiz do monorepo (instala `backend` e `frontend` de uma vez, via npm workspaces):

```bash
npm install
```

### 4. Rodar as migrations do Prisma

Com o PostgreSQL no ar (passo 2):

```bash
npm run prisma:migrate
```

Isso executa `prisma migrate dev` no workspace `backend`. Para apenas gerar o Prisma Client sem criar migration:

```bash
npm run prisma:generate
```

### 5. Rodar em desenvolvimento

Backend (NestJS, porta padrão `3000`):

```bash
npm run dev:backend
```

Frontend (Vite, porta padrão `5173`):

```bash
npm run dev:frontend
```

Endpoint de health check do backend: `GET http://localhost:3000/health`.

## Scripts úteis (raiz)

| Script | Descrição |
|---|---|
| `npm run dev:backend` | Sobe o backend em modo watch |
| `npm run dev:frontend` | Sobe o frontend em modo dev |
| `npm run build` | Builda backend e frontend |
| `npm run lint` | Roda lint em ambos os workspaces |
| `npm run format` | Roda o formatter (Prettier) em ambos os workspaces |
| `npm run prisma:generate` | Gera o Prisma Client |
| `npm run prisma:migrate` | Roda `prisma migrate dev` no backend |

Cada workspace também tem seus próprios scripts (`npm run <script> --workspace=backend` ou `--workspace=frontend`) — ver `backend/package.json` e `frontend/package.json`.

## Stack

- **Backend**: NestJS, Prisma, PostgreSQL, TypeScript, ESLint + Prettier.
- **Frontend**: Vite, React, TypeScript, React Router, TanStack Query, React Hook Form, Zod, Tailwind CSS, ESLint + Prettier.
- **Monorepo**: npm workspaces (ver ADR-007 em `especificacoes_sistema_credito_rural/11-DECISOES-ARQUITETURA.md`).

## Decisões arquiteturais

Ver `especificacoes_sistema_credito_rural/11-DECISOES-ARQUITETURA.md` (ADRs).
