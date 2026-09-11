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

O backend também lê um `.env` local em `backend/.env` (usado pelo Prisma CLI quando rodado diretamente no host, fora do Docker). Mantenha os valores de `DATABASE_URL` sincronizados entre `.env` (raiz) e `backend/.env`.

### 2. Subir tudo com Docker Compose (recomendado)

```bash
docker compose up -d --build
```

Isso sobe três containers:

- `postgres` — `postgres:16-alpine`, expondo a porta `5433` do host (configurável via `POSTGRES_PORT`; usamos 5433 por padrão porque é comum já haver um PostgreSQL nativo ocupando a porta 5432 na máquina do desenvolvedor), com volume nomeado para persistência dos dados.
- `backend` — NestJS em modo watch (`nest start --watch`), porta `3000` do host. Dentro da rede do compose ele acessa o Postgres pelo hostname `postgres` (não `localhost`).
- `frontend` — Vite dev server, porta `5173` do host.

O código de `backend/` e `frontend/` é montado como bind mount, então alterações no editor refletem nos containers com hot-reload. `node_modules` de cada workspace fica em volumes nomeados próprios do container (não usa o `node_modules` instalado no host), evitando conflito entre binários compilados para Windows/macOS e o Linux do container.

Na primeira subida (ou após alterar o `schema.prisma`), rode as migrations dentro do container do backend:

```bash
docker compose exec backend npm run prisma:migrate --workspace=backend
```

Para ver os logs:

```bash
docker compose logs -f backend frontend
```

Para derrubar:

```bash
docker compose down
```

Acesse a aplicação em `http://localhost:5173`. Endpoint de health check do backend: `GET http://localhost:3000/health`.

### 3. Alternativa: rodar sem Docker (apenas o Postgres em container)

Suba só o banco:

```bash
docker compose up -d postgres
```

Instale as dependências na raiz do monorepo (via npm workspaces):

```bash
npm install
```

Rode as migrations do Prisma (usa `backend/.env`, que aponta para `localhost:5433`):

```bash
npm run prisma:migrate
```

Para apenas gerar o Prisma Client sem criar migration:

```bash
npm run prisma:generate
```

Suba backend e frontend localmente, em dois terminais:

```bash
npm run dev:backend
npm run dev:frontend
```

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
