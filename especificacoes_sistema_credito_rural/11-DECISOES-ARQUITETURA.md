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

## Regra

Novas decisões importantes devem ser registradas aqui.

Formato:

Problema
→ Alternativas
→ Trade-off
→ Decisão
→ Consequências
