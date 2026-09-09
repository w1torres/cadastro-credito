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

## ADR-008 — Papel do usuário (Role) como enum Prisma

Status: ACEITO

Problema:
A Fase 2 (Backend Core) precisa modelar o papel do usuário (CONSULTOR, GERENTE, CREDITO, ADMIN) no schema Prisma. Não havia decisão prévia sobre modelar como enum fixo ou como tabela `roles` separada no banco.

Alternativas:
- **Tabela `roles` separada** com FK em `User`: permitiria papéis dinâmicos (criados/editados via admin) e metadados por papel (descrição, permissões granulares), mas adiciona uma junção extra em toda query que precisa do papel do usuário, e nenhuma especificação (00 a 12) prevê a necessidade de papéis dinâmicos ou configuráveis em tempo de execução.
- **Enum Prisma fixo**: papéis conhecidos e estáveis em tempo de compilação, sem junção extra, com checagem de exaustividade pelo TypeScript (`Role.CONSULTOR | Role.GERENTE | ...`).

Trade-off:
Um enum fixo exige uma migração de banco para adicionar/remover papéis — aceitável, pois a lista de papéis é uma decisão de negócio rara e já está fechada nas especificações (spec 01/04).

Decisão:
Modelar `Role` como **enum Prisma** (`CONSULTOR`, `GERENTE`, `CREDITO`, `ADMIN`), validado com o usuário responsável pelo projeto. Confirmado explicitamente com o usuário durante o planejamento da Fase 2 (opção recomendada).

Consequências:
- `User.role` é uma coluna enum indexada, sem tabela/junção adicional.
- Novos papéis exigem uma migração Prisma (`prisma migrate dev`), não apenas um INSERT.
- O guard `RolesGuard` e o decorator `@Roles(...)` (`src/auth/`) usam o enum diretamente, com checagem de tipo em tempo de compilação.

## ADR-009 — Escopo de visibilidade do CONSULTOR: apenas os próprios registros

Status: ACEITO

Problema:
Nenhuma especificação (00 a 12) definia explicitamente se um usuário CONSULTOR deveria enxergar todos os clientes/solicitações de crédito do sistema, ou apenas os que ele mesmo cadastrou. Isso afeta diretamente o filtro `WHERE` de `ClientsService.findAll` e `CreditRequestsService.findAll`.

Alternativas:
- **Visão global para CONSULTOR**: todo consultor vê todos os clientes/solicitações, simplificando a query (sem filtro por `consultantId`), mas expõe carteira de clientes de outros consultores sem necessidade de negócio evidenciada.
- **Visão restrita aos próprios registros**: CONSULTOR só vê/edita o que ele mesmo criou (`consultantId = user.id`); GERENTE/CREDITO/ADMIN continuam vendo tudo, pois precisam analisar solicitações de qualquer consultor.

Trade-off:
A visão restrita é consistente com o modelo de carteira de clientes por consultor comercial e com o princípio de menor privilégio; exige que toda query de listagem (`findAll`) e leitura por id (`findOneForUser`) aplique o filtro condicionalmente por `role`.

Decisão:
CONSULTOR enxerga e edita **apenas** os clientes e solicitações de crédito que ele mesmo cadastrou (`consultantId`); GERENTE, CREDITO e ADMIN enxergam todos os registros (mas apenas ADMIN e o CONSULTOR dono podem editar/excluir). Confirmado explicitamente com o usuário durante o planejamento da Fase 2 (opção recomendada).

Consequências:
- `ClientsService.assertVisible`/`assertEditable` e o equivalente em `CreditRequestsService` centralizam essa regra; `PropertiesService`/`ProductionService` reaproveitam `ClientsService` para o mesmo efeito via o cliente pai.
- Testado em `clients.service.spec.ts` (filtro `where` diferente por papel) e via chamadas HTTP reais na verificação manual da Fase 2 (CONSULTOR-A não acessa cliente do CONSULTOR-B → 403; GERENTE acessa e lê, mas não edita).

## ADR-010 — class-validator/class-transformer para validação de DTOs no backend

Status: ACEITO

Problema:
A Fase 2 introduz o primeiro conjunto real de DTOs de entrada (login, criação/edição de usuários, clientes, propriedades, solicitações de crédito) e nenhuma biblioteca de validação estava instalada no backend.

Alternativas:
- **Zod**, espelhando a escolha já feita no frontend (spec 08): manteria consistência de ferramenta entre as duas pontas, mas exigiria uma biblioteca de integração não trivial e não testada neste projeto (`nestjs-zod`) para obter o mesmo nível de integração automática com `ValidationPipe`, decorators e Swagger (Fase 8) que o NestJS já oferece nativamente para outra abordagem.
- **class-validator + class-transformer + `ValidationPipe` global**: é a abordagem idiomática e nativa do NestJS, com suporte de primeira classe a decorators (`@IsEmail`, `@IsEnum`, etc.), `whitelist`/`forbidNonWhitelisted` e geração futura de Swagger (Fase 8) sem lib adicional.

Trade-off:
Abrir mão da consistência de ferramenta com o frontend em favor da integração nativa e madura com o restante do ecossistema NestJS usado neste backend (guards, pipes, DTOs).

Decisão:
Usar **class-validator + class-transformer**, com um `ValidationPipe` global (`whitelist: true, forbidNonWhitelisted: true, transform: true`) registrado em `main.ts`.

Consequências:
- Validadores customizados (`IsCpfOrCnpj`, `IsDecimalString`) ficam em `src/common/validators/`, reutilizados por múltiplos DTOs.
- Campos `Decimal` do Prisma (hectares, limite de crédito, latitude/longitude) trafegam como string numérica validada, evitando arredondamento de ponto flutuante.
- Um filtro global (`HttpExceptionFilter`, `src/common/filters/`) traduz erros de validação e exceções HTTP para o envelope `{ success: false, error: { code, message } }` documentado na spec 04.

## ADR-011 — Autenticação JWT com relookup de usuário por requisição e guards globais

Status: ACEITO

Problema:
A Fase 2 precisa de autenticação e autorização (RBAC) reais; nenhuma biblioteca de auth estava instalada e a spec 06 exige que contas desativadas percam acesso imediatamente.

Alternativas:
- **JWT stateless puro** (payload confiável, sem consulta ao banco a cada requisição): menor custo por requisição, mas uma conta desativada ou com papel alterado continuaria válida até o token expirar (até 15 minutos), o que conflita com a exigência de segurança da spec 06.
- **JWT com relookup do usuário no banco a cada requisição** (`JwtStrategy.validate`): custo de uma consulta indexada por `id` a cada requisição autenticada, mas desativação de conta ou troca de papel têm efeito imediato.

Trade-off:
O custo de uma consulta indexada por PK a cada requisição é desprezível frente ao ganho de segurança operacional (revogação efetivamente imediata sem precisar de uma denylist de tokens).

Decisão:
Implementar autenticação via `@nestjs/jwt` + `passport-jwt`, com `JwtStrategy.validate` buscando o usuário no banco a cada requisição e rejeitando usuários inativos. `JwtAuthGuard` e `RolesGuard` são registrados **globalmente** (`APP_GUARD` em `AuthModule`); rotas usam `@Public()` para abrir exceção e `@Roles(...)` para restringir por papel, em vez de proteger rota por rota com `@UseGuards(...)`.

Consequências:
- Toda rota nova exige autenticação por padrão; esquecer de marcar uma rota pública é o erro seguro (fecha, não abre) — um caso real disso foi corrigido durante a verificação da Fase 2 (`HealthController` inicialmente retornava 401 até ganhar `@Public()`).
- Não há revogação de refresh token via denylist nesta fase (login/refresh apenas emitem/reemitem pares de token); uma denylist fica para uma fase futura caso se torne necessária.

## ADR-012 — Devolução do CRÉDITO com destino explícito quando ambíguo (OQ-A1)

Status: ACEITO

Problema:
A auditoria da Fase 0 deixou em aberto ("validar posteriormente") se uma devolução deveria sempre voltar ao papel imediatamente anterior (GERENTE→CONSULTOR, CRÉDITO→GERENTE) ou se existiam casos de devolução pulando etapa.

Alternativas:
- **Sempre o papel imediatamente anterior**: mais simples, mas não atende a um caso real de negócio confirmado pelo usuário durante o planejamento da Fase 3: o CRÉDITO pode identificar que o problema é do lado do consultor (ex.: documento faltante do cliente) e não do GERENTE, não fazendo sentido devolver ao GERENTE só para ele devolver de novo ao CONSULTOR em seguida.
- **Destino sempre escolhível livremente**: flexível demais — permitiria, em tese, pular para qualquer estado, contrariando a regra "transições inválidas retornam erro" (spec 03, regra 4).
- **Destino explícito apenas quando há mais de um destino válido definido na tabela de transições**: a resolução da transição continua vindo de uma tabela fechada (nenhum salto arbitrário é possível), mas quando mais de uma regra casa com (etapa atual, ação, papel) — hoje, só o caso do CRÉDITO em `CREDIT_REVIEW` — o chamador informa `targetStatus` para desambiguar.

Trade-off:
Adiciona uma pequena complexidade ao `WorkflowService.resolveRule` (contagem de candidatos, exigência condicional de `targetStatus`), mas evita tanto engessar demais (opção 1) quanto abrir demais (opção 2) o modelo.

Decisão:
`CREDIT_REVIEW` tem dois destinos de `RETURN` possíveis para o `CREDITO`: `RETURNED_TO_MANAGER` (padrão) e `RETURNED_TO_CONSULTANT` (pulando o GERENTE). `GERENTE` continua com um único destino (`RETURNED_TO_CONSULTANT`). `targetStatus` no payload de devolução é opcional quando há apenas um destino possível e obrigatório quando há mais de um — resolvido de forma genérica por contagem de candidatos, não por um `if` específico para "CRÉDITO".

Consequências:
- `ReturnCreditRequestDto.targetStatus` é opcional na validação de DTO; a obrigatoriedade condicional é responsabilidade do `WorkflowService`, não do `class-validator`.
- Se, no futuro, mais uma etapa ganhar múltiplos destinos de devolução, o mesmo mecanismo já resolve sem código novo — basta adicionar a linha na tabela `TRANSITIONS`.

## ADR-013 — Fechamento dos estados `REJECTED` e `CANCELLED`, e ADMIN como superusuário do workflow

Status: ACEITO

Problema:
`CreditRequestStatus` (definido desde a Fase 2) inclui `REJECTED` e `CANCELLED`, mas a tabela de transições da spec 03 não define nenhuma transição de/para esses estados — a própria auditoria observa isso como "uma lacuna aberta a decidir na Fase 3". Além disso, `ADMIN` não aparece na coluna "Papel" de nenhuma transição da spec 03, apesar de existir no RBAC (spec 06).

Alternativas (para REJECTED/CANCELLED):
- **Deixar os estados inatingíveis nesta fase**: mantém o enum "decorativo" sem uso real, adiando a decisão — mas os dois estados já existem desde a Fase 2 e não implementá-los é deixar uma lacuna já identificada sem fechar, quando fechá-la é direto.
- **Fechar a lacuna com uma transição mínima e bem justificada**: `REJECTED` alcançável apenas de `CREDIT_REVIEW` pelo `CREDITO` (espelha exatamente `CREDIT_REVIEW→APPROVED`, mesma origem/ator, resultado alternativo; motivo obrigatório); `CANCELLED` alcançável a partir de qualquer estado não-terminal e não-`DRAFT` (que já tem seu próprio caminho de exclusão via `DELETE`), apenas pelo `CONSULTOR` dono ou `ADMIN`, motivo opcional.

Alternativas (para ADMIN):
- **ADMIN sem poder de transição de workflow**: obrigaria suporte a pedir para o usuário certo (GERENTE/CREDITO) executar a ação, mesmo em uma correção administrativa excepcional.
- **ADMIN como superusuário do grafo de transições**: ignora a checagem de `roles` e `requiresOwnership` de qualquer regra, mas continua restrito às transições definidas na tabela (não pode pular estados fora do grafo, ex.: `DRAFT→APPROVED` direto).

Trade-off:
Fechar `REJECTED`/`CANCELLED` agora é uma decisão de engenharia razoável e reversível (nenhuma spec futura impede revisão); dar a ADMIN poder de superusuário espelha exatamente como `ADMIN` já se comporta em `ClientsService.assertEditable`/`CreditRequestsService.assertEditable` desde a Fase 2 — não é um padrão novo.

Decisão:
`REJECTED` e `CANCELLED` implementados conforme acima. `ADMIN` pode disparar qualquer transição da tabela `TRANSITIONS` independentemente de `roles`/`requiresOwnership`, nunca fora dela.

Consequências:
- `WorkflowService.resolveRule` trata `role === Role.ADMIN` como coringa na filtragem de candidatos; a checagem de `requiresOwnership` também é pulada para ADMIN.
- Testado em `workflow.service.spec.ts` ("lets ADMIN perform any role-gated transition without owning it" / "does not let ADMIN jump outside the defined transition graph").

## ADR-014 — Concorrência via `expectedUpdatedAt` obrigatório em toda transição

Status: ACEITO

Problema:
A spec 04 exige "usar `updatedAt` ou mecanismo equivalente para evitar sobrescrita silenciosa", sem detalhar se o mecanismo é obrigatório ou opcional, nem o formato exato.

Alternativas:
- **Opcional** (o cliente manda se quiser): mais simples de integrar no frontend, mas permite que o problema que a regra existe para evitar (dois atores decidindo sobre a mesma solicitação sem saber um do outro) continue acontecendo por omissão.
- **Obrigatório em toda transição**: o cliente sempre envia o `updatedAt` que tinha em mãos antes de disparar a ação; o backend rejeita com 409 se não bater com o valor atual.

Trade-off:
Tornar obrigatório é mais correto para o objetivo declarado da regra (transições de workflow têm consequência de negócio real — dois GERENTEs decidindo sobre a mesma solicitação ao mesmo tempo não deve passar silenciosamente), ao custo de exigir que o frontend (Fase 4) sempre retenha e reenvie o `updatedAt` mais recente.

Decisão:
`expectedUpdatedAt` (ISO 8601) é campo obrigatório em `TransitionDto` (base de submit/return/approve/reject/cancel). O `WorkflowService` compara com `creditRequest.updatedAt.toISOString()` antes de qualquer outra checagem e responde `409 Conflict` em caso de divergência.

Consequências:
- Nenhuma coluna de versão nova foi adicionada — reaproveita o `updatedAt` que o Prisma já mantém automaticamente (`@updatedAt`).
- O frontend (Fase 4) precisa sempre exibir/reter o `updatedAt` retornado pelo último `GET`/transição antes de permitir uma nova ação.

## ADR-015 — Auditoria (Fase 3) restrita a transições de workflow; pareceres e estágios de assinatura fora do escopo

Status: ACEITO

Problema:
`10-IMPLEMENTACAO-FASES.md` lista "auditoria" como um dos 6 itens da Fase 3, mas não especifica se isso significa instrumentar todo o CRUD já existente (users/clients/properties desde a Fase 2) ou apenas as novas transições de workflow. Separadamente, `CreditAnalysis`/"pareceres" (OQ-A3) e as transições `APPROVED→SIGNATURE_PENDING→SIGNED→COMPLETED` são mencionadas na spec 03, mas nenhuma delas está listada nos 6 itens literais da Fase 3.

Alternativas:
- **Auditoria retroativa de todo o CRUD da Fase 2**: mais completo, mas é uma expansão de escopo não pedida pelos 6 itens da Fase 3 e duplicaria esforço com uma eventual fase de hardening/observability (spec 10 cita isso na Fase 8).
- **Auditoria restrita às transições de workflow**: seguinda literalmente a regra da spec 04 ("status + history + audit deve ocorrer em transação" — associada especificamente ao workflow), e ao próprio `CreditRequestsService.create()` (para a solicitação nascer já com uma entrada de auditoria/histórico).

Decisão:
1. `AuditLog` é gravado apenas para: criação de solicitação de crédito (`CREDIT_REQUEST_CREATED`) e transições de workflow (`CREDIT_REQUEST_TRANSITION`). Nenhuma instrumentação retroativa nos endpoints de users/clients/properties da Fase 2.
2. Pareceres/`CreditAnalysis` (OQ-A3) **não são implementados nesta fase** — não constam nos 6 itens literais da Fase 3; ficam para quando essa funcionalidade for de fato especificada (provavelmente junto dos formulários da Fase 4, ou uma sub-fase própria). A pergunta OQ-A3 ("pareceres bloqueados fora da própria etapa?") permanece em aberto até lá.
3. `APPROVED→SIGNATURE_PENDING→SIGNED→COMPLETED` **não são implementados nesta fase** — dependem de atores ("autorizado"/"sistema/webhook") que não existem no RBAC atual e da integração Clicksign, exclusiva da Fase 6 (ADR-006). O enum já suporta esses valores desde a Fase 2; as transições são adicionadas quando a Fase 6 existir.
4. Retenção de audit log não é implementada — a spec 06 cita "retenção" como preocupação, mas nenhum valor concreto é dado em nenhum documento; nenhum job de expurgo foi criado.

Consequências:
- `AuditLog`/`CreditRequestHistory` cobrem hoje apenas a entidade `CreditRequest`; um novo requisito de auditoria em outra entidade exige uma decisão própria (reaproveitando `recordAudit()`, que já é genérico o suficiente).
- `CreditRequestStatus` mantém 3 valores (`SIGNATURE_PENDING`, `SIGNED`, `COMPLETED`) sem nenhuma transição que os alcance até a Fase 6 — isso é esperado, não um bug.

## Regra

Novas decisões importantes devem ser registradas aqui.

Formato:

Problema
→ Alternativas
→ Trade-off
→ Decisão
→ Consequências
