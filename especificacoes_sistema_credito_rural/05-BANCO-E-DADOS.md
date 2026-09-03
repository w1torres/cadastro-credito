# Especificação 05 — Banco e Modelo de Dados

## Banco

PostgreSQL + Prisma.

Não utilizar sincronização automática de schema em produção.

Utilizar migrations.

## Tabelas candidatas

- users
- roles
- clients
- persons
- partners
- properties
- property_productions
- credit_requests
- credit_analyses
- credit_request_history
- documents
- document_types
- signature_requests
- comments
- audit_logs

## Campos fundamentais

Todas as entidades relevantes devem possuir, quando aplicável:

- id
- createdAt
- updatedAt

Workflow deve possuir:

- status;
- responsibleUserId;
- timestamps;
- history.

## Índices

Avaliar índices para:

- status;
- clientId;
- responsibleUserId;
- createdAt;
- updatedAt;
- CPF/CNPJ;
- chaves estrangeiras;
- filtros frequentes.

## Integridade

Avaliar:

- foreign keys;
- unique;
- not null;
- check constraints quando apropriado.

## Arquivos

Não armazenar arquivos grandes diretamente no PostgreSQL.

Utilizar uma abstração:

`StorageService`

Possíveis implementações:

- local;
- S3;
- MinIO;
- Azure Blob.

## Dados sensíveis

CPF/CNPJ e documentos pessoais devem ter acesso controlado.

Evitar dados pessoais em logs.
