# Prompt de Execução — Claude Code

Você é o responsável pela implementação deste projeto.

Leia primeiro:

- `00-CONTEXTO-PROJETO.md`
- `01-AUDITORIA-E-REQUISITOS.md`
- `02-UX-E-FLUXOS.md`
- `03-DOMINIO-E-WORKFLOW.md`
- `04-API-BACKEND.md`
- `05-BANCO-E-DADOS.md`
- `06-SEGURANCA-E-LGPD.md`
- `07-DOCUMENTOS-E-CLICKSIGN.md`
- `08-FRONTEND-E-COMPONENTES.md`
- `09-TESTES-E-ACEITE.md`
- `10-IMPLEMENTACAO-FASES.md`
- `11-DECISOES-ARQUITETURA.md`

## Regra principal

Não reescreva o sistema inteiro sem necessidade.

Primeiro entenda.

Depois altere.

Depois valide.

## Ordem obrigatória

1. auditar;
2. mapear;
3. propor;
4. implementar;
5. testar;
6. corrigir;
7. documentar.

## Antes de cada alteração

Informe internamente:

- sintoma/problema;
- evidência;
- hipótese;
- causa;
- correção;
- impacto.

## Não fazer

- não inventar regras de negócio;
- não ignorar o HTML existente;
- não colocar regra crítica apenas no frontend;
- não criar microsserviços;
- não adicionar dependências sem justificativa;
- não vazar secrets;
- não ignorar testes.

## Critério

Sempre prefira a menor alteração arquitetural que resolva corretamente o problema.

## Primeiro comando lógico

Comece pela auditoria completa do repositório.

Não comece implementando Clicksign.

Não comece implementando o workflow antes de entender os dados existentes.

Primeiro produza a documentação da Fase 0.

Depois avance incrementalmente.
