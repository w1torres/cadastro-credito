# Prompt de ajustes: fluxo de solicitação de crédito e preparação para produção

Use este arquivo como contexto para o Claude corrigir o fluxo de solicitação e
deixar o ambiente pronto para produção. Leia-o inteiro antes de alterar código.

## 1. Contexto do sistema

Projeto: `cadastro-credito` (monorepo npm workspaces).

- `backend/`: NestJS + Prisma + PostgreSQL. Testes com Vitest (`npm test` em `backend`).
- `frontend/`: React + Vite + React Query + react-hook-form/zod.
- Ambiente local: `docker compose` (serviços `backend`, `frontend`, `postgres`).
  O backend roda em `localhost:3002` (`PORT` no `.env` da raiz). O frontend roda em
  `localhost:5173` e chama a API por `VITE_API_URL` (no `.env` da raiz).
- Perfis: `CONSULTOR`, `GERENTE` (filial), `CREDITO`, `ADMIN`.
- Login: somente Microsoft Entra ID (`POST /auth/entra`). Em teste local existe
  `POST /auth/dev-login` e `GET /auth/dev-users`, que só funcionam com
  `AUTH_DEV_LOGIN=true` e `NODE_ENV != production`.

### Fluxo da solicitação (máquina de estados)

Regras em `backend/src/credit-requests/workflow.types.ts` (fonte única) e
transições em `workflow.service.ts`.

```
DRAFT / RETURNED_TO_CONSULTANT --SUBMIT (CONSULTOR)--> SUBMITTED_TO_MANAGER
SUBMITTED_TO_MANAGER --SUBMIT (GERENTE)--> MANAGER_REVIEW
MANAGER_REVIEW --RETURN (GERENTE)--> RETURNED_TO_CONSULTANT
MANAGER_REVIEW --SUBMIT (GERENTE)--> SUBMITTED_TO_CREDIT   [gate: sem pendências e ficha APROVADA]
SUBMITTED_TO_CREDIT --SUBMIT (CREDITO)--> CREDIT_REVIEW
CREDIT_REVIEW --RETURN (CREDITO)--> RETURNED_TO_MANAGER      (somente gerente; NÃO consultor)
CREDIT_REVIEW --APPROVE / REJECT (CREDITO)--> APPROVED / REJECTED
RETURNED_TO_MANAGER --SUBMIT (GERENTE)--> MANAGER_REVIEW
```

Ordem de envio esperada (regra de negócio confirmada):
1. CONSULTOR envia para o GERENTE da filial.
2. GERENTE envia para o CREDITO.
3. CREDITO devolve somente para o GERENTE da filial.
4. GERENTE devolve para o CONSULTOR.

### Regras de documentos e ficha (já implementadas)

- Pendências de documento (`DocumentPendency`, tipo + motivo FALTANTE/ERRADO) são
  marcadas pelo GERENTE (etapa dele) ou pelo CREDITO (etapa dele), ou na devolução.
- Ficha cadastral (`fichaCadastralSituacao`: EM_ANALISE, APROVADA, REPROVADA).
- Gate: GERENTE só envia ao CREDITO com zero pendências e ficha APROVADA.
- Consultor: não envia com pendências (`requiresSemPendencias`). Anexar documento de um
  tipo pendente remove a pendência desse tipo (`DocumentsService.upload`).
- Visão do consultor: mostra pendências e situação da ficha; esconde status/histórico.
- Checklist de 9 documentos: `backend/src/credit-requests/constants.ts` e
  `frontend/src/lib/document-checklist.ts`.

## 2. Problemas que ainda impedem o fluxo (corrigir nesta ordem)

### P1. Envio do consultor exige assinatura SPC/Bacen (bloqueio principal)

`workflow.types.ts`: as regras `SUBMIT` de `DRAFT` e de `RETURNED_TO_CONSULTANT`
têm `requiresSignedAuthorization: true`. Sem uma `SignatureRequest` com status
`SIGNED`, o envio é recusado com "É necessário que o cliente assine a autorização
de consulta ao SPC/Bacen...". Em ambiente de teste não há Clicksign configurado,
então o consultor nunca consegue enviar.

Ação:
- Confirmar com o negócio se a assinatura SPC/Bacen deve bloquear o envio ao
  gerente ou apenas a análise de crédito. Não assumir.
- Se a regra for mantida, a tela deve mostrar o passo de assinatura e o motivo do
  bloqueio no botão (hoje só o backend recusa).
- Para teste local, oferecer um modo de desenvolvimento (ex.: `CLICKSIGN_MOCK=true`,
  só fora de produção) que marca a assinatura como SIGNED. Não afrouxar a regra em
  produção.

### P2. Botão "Enviar para gerente" do consultor

Já desabilitado com pendências (`bloqueioEnvioConsultor` em
`CreditRequestDetailPage.tsx`). Falta:
- Desabilitar também quando faltar assinatura SPC/Bacen (espelhar a regra do backend).
- Mensagem clara no mesmo lugar do bloqueio de pendências.
- Validar que, após anexar todos os documentos pendentes, o botão é liberado (depende
  de P1 para enviar de fato).

### P3. Visão do gerente

- A seção "Revisão de documentos e ficha cadastral" (`PendenciasDocumentosCard.tsx`,
  `RevisaoDocumentosCard`) deve listar os documentos anexados com "Abrir" (já usa
  `ChecklistAnalise`). Validar com dados reais.
- O botão "Enviar para crédito" deve ficar desabilitado com a mensagem de pendência
  ou ficha não aprovada (já implementado para `MANAGER_REVIEW`). Validar.
- A fila do gerente (`DashboardPage.tsx`) deve mostrar só a filial dele. Validar o
  filtro por consultor e status.

### P4. Devolução do crédito

- A modal "Devolver" do crédito deve ter um único destino (gerente). Já ajustado em
  `frontend/src/lib/workflow.ts` e na regra do backend. Validar que o botão diz
  "Devolver ao gerente" e não mostra seletor.
- A devolução deve aceitar a lista de documentos faltantes/errados
  (`pendencias`), que substitui as pendências atuais.

### P5. Testes de fluxo ponta a ponta (ainda não feitos)

Não há teste automatizado do fluxo completo. Criar testes de serviço (Vitest) para:
- consultor: envio bloqueado com pendência e sem assinatura; liberado sem os dois;
- upload de documento de tipo pendente remove a pendência;
- gerente: gate para o crédito (pendência e ficha);
- crédito: devolução só para o gerente (`targetStatus` de consultor é recusado).

## 3. Dados e ambiente de teste (não levar para produção)

- Seed (`backend/prisma/seed.ts`) cria usuários e filiais de teste. Não rodar em produção
  (o script já recusa `NODE_ENV=production`).
- Dados de teste criados manualmente no banco local: clientes "CLIENTE TESTE ...",
  solicitações de teste, consultores/gerentes `@teste.local` e `@example.com`.
  Não copiar esses dados para produção.
- Filiais atuais (nomes simples): Buritis, Catalão, Cristalina, Formosa,
  Guarda-Mor, Luziânia, Padre Bernardo, Palmeiras de Goiás, Paracatu, Unaí, Uruaçu,
  Vianópolis. Os códigos de usuário (ex.: RC0105, GE0101) definem perfil e filial pelos
  dígitos 2 e 3 (ex.: `01` = Formosa).
- `AUTH_DEV_LOGIN` e `VITE_AUTH_DEV_LOGIN` devem estar ausentes ou `false` em produção.

## 4. Migrações a aplicar em produção (todas aditivas)

Em ordem, com backup antes:

1. `20261005120000_add_document_pendencies_and_ficha`
2. `20261006100000_add_document_pendency_motivo`
3. `20261006120000_users_entra_id_login` (torna `users.passwordHash` opcional)
4. `20261007100000_add_user_codigo` (coluna `users.codigo` + índice, não único)

Aplicar com `npx prisma migrate deploy` (nunca `migrate dev` em produção).

Antes de qualquer alteração de dados em produção:
- gerar dump (`BACKUP_BANCO=1` em `deploy-vm.sh` ou `pg_dump` direto);
- não usar o seed;
- revisar a execução com simulação antes de gravar.

## 5. Configuração necessária em produção

- Backend: `ENTRA_TENANT_ID`, `ENTRA_CLIENT_ID`, `JWT_*`, `CORS_ORIGIN`, `NODE_ENV=production`.
- Frontend: `VITE_ENTRA_TENANT_ID`, `VITE_ENTRA_CLIENT_ID`, `VITE_ENTRA_REDIRECT_URI`
  (app registration com URL de redirecionamento do tipo SPA).
- Usuários de produção precisam ter o e-mail corporativo igual à conta Microsoft.
- Clicksign (se mantido o bloqueio P1): credenciais e webhook configurados.

## 6. Deploy e Docker (lições do ambiente local)

- Volumes nomeados de `node_modules` (`*_node_modules`) podem ficar com dependências
  antigas. Após mudar dependências ou o schema do Prisma, recriar o volume e o container.
- Não rodar `nest build` local com o container `backend` em modo watch: os dois gravam
  em `backend/dist` e geram módulos inconsistentes. Se acontecer, apagar `backend/dist`
  e reiniciar o container.
- O `docker-compose.yml` lê `env_file: .env` da raiz. Variáveis só no `backend/.env`
  não chegam ao container.
- `package-lock.json` é usado pelo `npm ci` no Docker. Confirmar que ele está versionado.

## 7. Checklist de validação manual (por perfil)

Preparar com dados de teste locais, e depois repetir com dados reais em homologação.

- **CONSULTOR**
  - [ ] Vê só as próprias solicitações; não vê aba Clientes.
  - [ ] Vê pendências (documento e motivo) e ficha; não vê status/histórico.
  - [ ] Anexa documento de tipo pendente e a pendência some.
  - [ ] Botão "Enviar para gerente" desabilitado com pendência (e sem assinatura, após P1).
  - [ ] Envio liberado quando não há pendências e a assinatura está ok.
- **GERENTE** (filial)
  - [ ] Fila só com a própria filial; filtros por consultor e status.
  - [ ] Revisão: vê os documentos com "Abrir", marca pendências e ficha.
  - [ ] "Enviar para crédito" bloqueado com pendência ou ficha não aprovada.
  - [ ] Devolve ao consultor com lista de documentos faltantes/errados.
- **CREDITO**
  - [ ] Vê aba Clientes (todas as filiais) e fila com filtros de filial, consultor e status.
  - [ ] Devolve só ao gerente da filial (sem seletor de consultor).
  - [ ] Aprova ou reprova.
- **ADMIN**
  - [ ] Cria e edita usuários (perfil, filial, código, ativo/inativo).
- **Login**
  - [ ] Login Microsoft funciona; usuário não cadastrado é recusado.
  - [ ] Login de teste não aparece em produção.

## 8. Arquivos principais

- Backend: `src/credit-requests/` (workflow, serviço, controller, constants),
  `src/documents/documents.service.ts`, `src/auth/` (Entra, dev-login),
  `src/users/`, `prisma/schema.prisma`, `prisma/migrations/`.
- Frontend: `src/features/credit-requests/CreditRequestDetailPage.tsx`,
  `PendenciasDocumentosCard.tsx`, `EditClientRequestPage.tsx`,
  `src/features/documents/ChecklistAnalise.tsx`, `src/features/dashboard/DashboardPage.tsx`,
  `src/features/auth/LoginPage.tsx`, `src/features/admin/`, `src/lib/workflow.ts`,
  `src/lib/document-checklist.ts`, `src/App.tsx`, `src/components/layout/Sidebar.tsx`.

## 9. Como trabalhar

- Corrigir um problema por vez, com teste automatizado quando houver regra de backend.
- Não alterar regra de negócio sem confirmação (especialmente P1).
- Não apagar dados de produção sem backup e simulação.
- Ao final, rodar `npm test` no backend, `npx tsc -b` e `npm run build` no frontend.
