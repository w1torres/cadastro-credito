# Especificação 06 — Segurança e LGPD

## Autenticação

Implementar autenticação segura.

Possível MVP:

- JWT;
- access token;
- refresh token;
- senha com hash seguro.

Preparar para SSO futuro.

## Autorização

RBAC:

- CONSULTOR
- GERENTE
- CREDITO
- ADMIN

Além da role, verificar:

- estado;
- propriedade da solicitação;
- permissões;
- contexto.

## Upload

Validar no servidor:

- extensão;
- MIME;
- tamanho;
- conteúdo quando necessário;
- nome;
- storage.

Nunca executar arquivos enviados.

## API

Considerar:

- HTTPS;
- CORS restritivo;
- rate limiting;
- validação;
- headers de segurança;
- proteção contra abuso.

## Secrets

Nunca colocar secrets no frontend.

Nunca commitar `.env`.

Criar `.env.example`.

## Clicksign

Credenciais somente no backend.

Webhook deve validar autenticidade segundo a documentação oficial vigente.

Implementar idempotência.

## Auditoria

Registrar:

- usuário;
- ação;
- entidade;
- entidadeId;
- timestamp;
- requestId quando útil;
- metadata mínima necessária.

## LGPD

Considerar:

- finalidade;
- minimização;
- controle de acesso;
- retenção;
- proteção;
- rastreabilidade;
- exclusão quando aplicável.

Não expor dados pessoais desnecessariamente na interface ou logs.
