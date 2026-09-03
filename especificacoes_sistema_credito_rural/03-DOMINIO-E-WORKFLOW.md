# Especificação 03 — Domínio e Workflow

## Entidades candidatas

- User
- Role
- Client
- Person
- Partner
- Property
- PropertyProduction
- CreditRequest
- CreditAnalysis
- CreditRequestHistory
- Document
- DocumentType
- SignatureRequest
- Comment
- AuditLog

Validar a necessidade de cada entidade durante a implementação.

## Relacionamento

Client
→ Persons/Partners
→ Properties
→ Production
→ Documents
→ CreditRequests

## Estados

### Solicitação

- DRAFT
- SUBMITTED_TO_MANAGER
- MANAGER_REVIEW
- RETURNED_TO_CONSULTANT
- SUBMITTED_TO_CREDIT
- CREDIT_REVIEW
- RETURNED_TO_MANAGER
- APPROVED
- REJECTED
- SIGNATURE_PENDING
- SIGNED
- COMPLETED
- CANCELLED

## Transições

| Origem | Ação | Destino | Papel |
|---|---|---|---|
| DRAFT | enviar | SUBMITTED_TO_MANAGER | CONSULTOR |
| SUBMITTED_TO_MANAGER | iniciar análise | MANAGER_REVIEW | GERENTE |
| MANAGER_REVIEW | devolver | RETURNED_TO_CONSULTANT | GERENTE |
| RETURNED_TO_CONSULTANT | reenviar | SUBMITTED_TO_MANAGER | CONSULTOR |
| MANAGER_REVIEW | encaminhar | SUBMITTED_TO_CREDIT | GERENTE |
| SUBMITTED_TO_CREDIT | iniciar análise | CREDIT_REVIEW | CREDITO |
| CREDIT_REVIEW | devolver | RETURNED_TO_MANAGER | CREDITO |
| RETURNED_TO_MANAGER | revisar | MANAGER_REVIEW | GERENTE |
| CREDIT_REVIEW | aprovar | APPROVED | CREDITO |
| APPROVED | solicitar assinatura | SIGNATURE_PENDING | autorizado |
| SIGNATURE_PENDING | assinatura concluída | SIGNED | sistema/webhook |
| SIGNED | concluir | COMPLETED | sistema/autorizado |

A matriz acima é uma proposta inicial e deve ser validada com o negócio antes de ser considerada definitiva.

## Regras

1. Frontend nunca define sozinho permissões.
2. Backend valida estado atual.
3. Backend valida papel.
4. Transições inválidas retornam erro.
5. Devoluções exigem motivo.
6. Histórico não deve ser apagado.
7. Transição + histórico + auditoria devem ser transacionais.

## Máquina de estados

Implementar serviço dedicado:

`WorkflowService`

Evitar espalhar regras de workflow por controllers.
