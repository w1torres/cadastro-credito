# Sistema de Solicitação e Análise de Crédito Rural

## Objetivo

Transformar o protótipo HTML existente em uma aplicação corporativa para cadastro de clientes/produtores rurais, propriedades, produção, documentos e solicitação de crédito.

O processo envolve três atores principais:

- CONSULTOR
- GERENTE
- CRÉDITO

Fluxo principal:

CONSULTOR → GERENTE → CRÉDITO

Com devoluções:

- GERENTE → CONSULTOR
- CRÉDITO → GERENTE → CONSULTOR

A aplicação também deverá integrar com a Clicksign para assinatura eletrônica de documentos gerados ou anexados.

## Diretriz arquitetural

Preferir um Modular Monolith no MVP.

Stack de referência:

### Frontend
- React
- TypeScript
- Vite
- React Router
- TanStack Query
- React Hook Form
- Zod
- Tailwind CSS
- shadcn/ui
- Lucide React
- TanStack Table

### Backend
- Node.js
- TypeScript
- NestJS
- Prisma
- PostgreSQL
- REST API
- OpenAPI/Swagger

Não introduzir microsserviços, Redis, Kafka ou Kubernetes sem necessidade comprovada.

## Princípios

1. Preservar funcionalidades corretas do protótipo.
2. Alterar somente o necessário.
3. Regras de negócio críticas devem estar no backend.
4. Workflow deve ser persistido no banco.
5. Toda transição deve ser autorizada e auditável.
6. Documentos não devem ser armazenados diretamente no PostgreSQL.
7. Credenciais da Clicksign nunca devem chegar ao frontend.
8. UX deve ser responsiva e orientada ao processo.
9. O formulário deve utilizar wizard/stepper.
10. Deve existir revisão antes do envio.
11. Deve existir histórico imutável das transições.
12. Dados pessoais e documentos devem ser tratados considerando LGPD.

## Workflow conceitual

DRAFT
→ SUBMITTED_TO_MANAGER
→ MANAGER_REVIEW
→ SUBMITTED_TO_CREDIT
→ CREDIT_REVIEW
→ APPROVED
→ SIGNATURE_PENDING
→ SIGNED
→ COMPLETED

Rotas de devolução:

MANAGER_REVIEW → RETURNED_TO_CONSULTANT
CREDIT_REVIEW → RETURNED_TO_MANAGER
MANAGER_REVIEW → RETURNED_TO_CONSULTANT

As transições permitidas devem ser formalizadas em uma máquina de estados.

## Documento e assinatura

Fluxo:

Solicitação aprovada
→ gerar/anexar documento
→ criar solicitação de assinatura
→ Clicksign
→ webhook
→ atualizar status
→ registrar auditoria
→ processo concluído

A integração deve utilizar uma abstração SignatureService/ClicksignAdapter.

## Segurança

Considerar:

- autenticação;
- RBAC;
- menor privilégio;
- validação de entrada;
- CORS;
- rate limiting;
- upload seguro;
- proteção de secrets;
- auditoria;
- logs sem exposição desnecessária de dados;
- controle de acesso aos documentos.

## Primeira implementação

Antes de codificar:

1. auditar o repositório;
2. analisar o HTML existente;
3. mapear funcionalidades;
4. definir domínio;
5. definir workflow;
6. definir UX;
7. definir API;
8. definir banco;
9. implementar incrementalmente;
10. validar cada etapa.

O protótipo atual é referência funcional, não arquitetura final.
