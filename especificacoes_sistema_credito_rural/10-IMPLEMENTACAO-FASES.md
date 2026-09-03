# Especificação 10 — Plano de Implementação

## Fase 0 — Auditoria

- analisar repositório;
- analisar HTML;
- gerar PROJECT_AUDIT;
- gerar mapa funcional;
- listar dúvidas.

## Fase 1 — Fundação

- monorepo ou estrutura frontend/backend;
- TypeScript;
- lint;
- formatter;
- env;
- Docker Compose;
- PostgreSQL;
- Prisma.

## Fase 2 — Backend Core

- users;
- auth;
- roles;
- clients;
- properties;
- credit requests.

## Fase 3 — Workflow

- estados;
- transições;
- permissões;
- histórico;
- devoluções;
- auditoria.

## Fase 4 — Frontend

- layout;
- login;
- dashboards;
- wizard;
- formulários;
- propriedades;
- documentos;
- revisão.

## Fase 5 — Documentos

- storage;
- upload;
- geração;
- visualização.

## Fase 6 — Clicksign

- adapter;
- criação de assinatura;
- webhook;
- idempotência;
- atualização de status.

## Fase 7 — Testes

- unitários;
- integração;
- E2E;
- testes responsivos.

## Fase 8 — Hardening

- segurança;
- performance;
- observabilidade;
- logs;
- health checks;
- documentação.

## Regra

Ao final de cada fase:

1. executar testes;
2. corrigir regressões;
3. atualizar documentação;
4. registrar decisões;
5. somente então avançar.
