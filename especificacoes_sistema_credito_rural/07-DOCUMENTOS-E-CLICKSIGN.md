# Especificação 07 — Documentos e Clicksign

## Objetivo

Permitir gerar ou anexar documento e encaminhá-lo para assinatura eletrônica.

## Arquitetura

Application
→ SignatureService
→ ClicksignAdapter
→ Clicksign

O domínio não deve depender diretamente do SDK/API da Clicksign.

## Documentos

Tipos possíveis devem ser definidos com o negócio.

Cada documento deve possuir:

- id;
- tipo;
- nome;
- storageKey;
- mimeType;
- size;
- status;
- uploadedBy;
- createdAt;
- updatedAt.

## Geração

Criar:

`DocumentGenerationService`

Responsabilidades:

- receber dados;
- aplicar template;
- gerar documento;
- persistir metadata;
- retornar referência.

## Assinatura

Criar:

`SignatureService`

Responsabilidades:

- criar solicitação;
- acompanhar status;
- consultar assinatura;
- processar eventos.

## Estados

Exemplo:

- PENDING
- SENT
- VIEWED
- SIGNED
- DECLINED
- EXPIRED
- CANCELLED

Validar estados reais disponíveis na integração adotada.

## Webhook

`POST /api/webhooks/clicksign`

Requisitos:

- validar autenticidade;
- idempotência;
- registrar evento;
- atualizar assinatura;
- atualizar solicitação;
- registrar auditoria.

## Regra

Não implementar detalhes da API Clicksign por memória. Consultar a documentação oficial vigente antes da implementação.

## Segurança

- nunca expor API key;
- não colocar credenciais no React;
- não aceitar callback sem validação;
- registrar erros sem vazar secrets.
