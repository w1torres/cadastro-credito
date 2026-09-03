# Especificação 01 — Auditoria e Requisitos

## Objetivo

Auditar o projeto existente antes de qualquer refatoração.

## Entradas

- Repositório atual
- `projeto_solicitacao_credito_atualizado_v3.html`
- demais arquivos existentes

## Entregáveis

Criar:

- `docs/PROJECT_AUDIT.md`
- `docs/REQUIREMENTS.md`
- `docs/FUNCTIONAL-MAP.md`

## Auditoria

Identificar:

- stack atual;
- estrutura de diretórios;
- dependências;
- funcionalidades;
- estado local;
- dados mockados;
- validações;
- componentes reutilizáveis;
- problemas de segurança;
- problemas de UX;
- problemas de responsividade;
- pontos de acoplamento;
- código morto;
- riscos técnicos.

## Mapeamento do protótipo

Mapear:

- dados do cliente;
- sócios/proprietários;
- solicitação;
- propriedades;
- produção;
- documentos;
- pareceres;
- workflow;
- assinatura.

Para cada item informar:

| Protótipo | Componente alvo | Entidade | API |
|---|---|---|---|

## Requisitos funcionais iniciais

### RF01 — Cliente

Cadastrar, consultar e editar cliente conforme permissões.

### RF02 — Proprietários/Sócios

Permitir múltiplas pessoas relacionadas ao cliente.

### RF03 — Propriedades

Permitir múltiplas propriedades.

### RF04 — Produção

Permitir dados produtivos por propriedade/safra.

### RF05 — Documentos

Permitir anexar, consultar e controlar documentos.

### RF06 — Solicitação

Criar e manter solicitação de crédito.

### RF07 — Workflow

Controlar transições por papel e estado.

### RF08 — Devolução

Exigir motivo para divergências.

### RF09 — Histórico

Registrar todas as transições.

### RF10 — Assinatura

Gerar/anexar documento e encaminhar para Clicksign.

### RF11 — Auditoria

Registrar ações relevantes.

## Requisitos não funcionais

- responsivo;
- acessível;
- seguro;
- testável;
- observável;
- modular;
- persistente;
- preparado para produção.

## Regra

Não inventar regras de negócio não evidenciadas. Quando uma regra estiver indefinida, registrar como `OPEN QUESTION`.
