# Especificação 04 — Backend e API

## Stack

- Node.js
- TypeScript
- NestJS
- Prisma
- PostgreSQL
- REST
- Swagger/OpenAPI

## Módulos

- auth
- users
- clients
- properties
- credit
- workflow
- documents
- signatures
- audit

## Endpoints iniciais

### Auth

POST `/api/auth/login`
POST `/api/auth/refresh`
POST `/api/auth/logout`

### Clients

GET `/api/clients`
POST `/api/clients`
GET `/api/clients/:id`
PATCH `/api/clients/:id`

### Properties

GET `/api/properties`
POST `/api/properties`
GET `/api/properties/:id`
PATCH `/api/properties/:id`

### Credit Requests

GET `/api/credit-requests`
POST `/api/credit-requests`
GET `/api/credit-requests/:id`
PATCH `/api/credit-requests/:id`

POST `/api/credit-requests/:id/submit`
POST `/api/credit-requests/:id/return`
POST `/api/credit-requests/:id/approve`

GET `/api/credit-requests/:id/history`

### Documents

POST `/api/documents`
GET `/api/documents/:id`
DELETE `/api/documents/:id`

### Signatures

POST `/api/signatures`
GET `/api/signatures/:id`

### Webhook

POST `/api/webhooks/clicksign`

## Padrão de erro

```json
{
  "success": false,
  "error": {
    "code": "WORKFLOW_INVALID_TRANSITION",
    "message": "A solicitação não pode ser encaminhada neste estado."
  }
}
```

Nunca retornar stack trace ao cliente.

## Validação

Validar no backend:

- payload;
- UUID/IDs;
- regras de negócio;
- estado;
- role;
- upload;
- permissões.

## Transações

Workflow:

status + history + audit

deve ocorrer em transação.

## Health

GET `/health`
GET `/health/ready`

## Concorrência

Usar `updatedAt` ou mecanismo equivalente para evitar sobrescrita silenciosa.
