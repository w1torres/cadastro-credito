# Especificação 11 — Registro de Decisões Arquiteturais

Use este arquivo como ADR index.

## ADR-001 — Modular Monolith

Status: PROPOSTA

Decisão:
Utilizar Modular Monolith no MVP.

Motivo:
Reduz complexidade operacional e mantém módulos preparados para futura separação.

## ADR-002 — PostgreSQL

Status: PROPOSTA

Decisão:
PostgreSQL como banco principal.

Motivo:
Relacionamentos, transações, integridade e maturidade.

## ADR-003 — React + TypeScript

Status: PROPOSTA

Decisão:
React + TypeScript para frontend.

Motivo:
Ecossistema, tipagem, componentização e manutenção.

## ADR-004 — NestJS

Status: PROPOSTA

Decisão:
NestJS no backend.

Motivo:
Estrutura modular, DI, guards, validação e organização para domínio corporativo.

## ADR-005 — Workflow persistido

Status: PROPOSTA

Decisão:
Estado do workflow persistido no banco.

Motivo:
O processo é de negócio e precisa sobreviver a sessões, dispositivos e reinicializações.

## ADR-006 — Clicksign Adapter

Status: PROPOSTA

Decisão:
Isolar integração externa por adapter.

Motivo:
Reduz acoplamento e facilita testes/substituição.

## ADR-007 — Gerenciamento de monorepo com npm workspaces

Status: ACEITO

Problema:
A Fase 1 (Fundação) exige uma estrutura de monorepo ou frontend/backend separados para acomodar a aplicação NestJS (`/backend`) e a aplicação React/Vite (`/frontend`) num único repositório, com instalação e scripts coordenados. Não havia ADR prévio definindo a ferramenta de orquestração desse monorepo.

Alternativas:
- **Turborepo**: cache de build/lint distribuído, pipelines declarativos, mas adiciona uma dependência e uma camada de configuração (`turbo.json`) não necessárias para dois pacotes com pouco acoplamento nesta fase.
- **Nx**: recursos avançados de grafo de dependências, geradores e cache remoto, porém com complexidade e superfície de configuração desproporcionais ao tamanho atual do projeto (2 workspaces).
- **pnpm/yarn workspaces**: equivalentes funcionais ao npm workspaces, mas exigiriam trocar o gerenciador de pacotes já disponível e testado no ambiente (npm v11), sem ganho relevante para o escopo atual.
- **npm workspaces**: recurso nativo do npm (>=7), sem dependência adicional, com `npm install` único na raiz resolvendo e linkando `backend` e `frontend`, e scripts por workspace via `npm run <script> --workspace=<nome>` ou `--workspaces` para todos.

Trade-off:
npm workspaces não oferece cache de build/lint nem execução paralela otimizada como Turborepo/Nx — para um monorepo de apenas 2 pacotes na Fase 1, isso é aceitável. Se o número de módulos/pacotes crescer significativamente nas fases seguintes e o tempo de build/lint se tornar um problema real, a decisão pode ser revisitada.

Decisão:
Utilizar **npm workspaces** (nativo, sem dependência extra) como mecanismo de monorepo, com `"workspaces": ["backend", "frontend"]` no `package.json` da raiz.

Consequências:
- Um único `npm install` na raiz instala e linka as dependências de `backend` e `frontend`.
- Scripts agregados na raiz (`npm run build`, `npm run lint`, etc.) usam `--workspaces` para rodar em todos os pacotes, ou `--workspace=<nome>` para um pacote específico.
- Nenhuma dependência de build tool de monorepo (Turborepo, Nx) foi introduzida, em linha com o princípio de "não adicionar dependências sem justificativa".
- Caso a necessidade de cache/paralelismo de build surja nas fases seguintes, uma nova ADR deve avaliar a migração para Turborepo ou Nx.

## Regra

Novas decisões importantes devem ser registradas aqui.

Formato:

Problema
→ Alternativas
→ Trade-off
→ Decisão
→ Consequências
