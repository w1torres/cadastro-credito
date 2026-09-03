# Especificação 02 — UX e Fluxos

## Objetivo

Transformar o formulário longo em uma experiência guiada.

## Wizard

Etapas:

1. Cliente
2. Proprietários/Sócios
3. Solicitação de Crédito
4. Propriedades
5. Produção
6. Documentos
7. Revisão
8. Envio

## Regras UX

- permitir salvar rascunho;
- preservar dados ao navegar entre etapas;
- mostrar progresso;
- validar por etapa;
- indicar campos obrigatórios;
- mostrar erros próximos aos campos;
- usar campos condicionais;
- evitar campos desnecessários;
- permitir voltar sem perder dados;
- mostrar revisão antes do envio.

## Responsividade

Priorizar:

- 320px;
- 375px;
- 390px;
- 414px;
- 768px;
- 1024px;
- 1280px+.

No mobile:

- sidebar vira drawer;
- wizard vira indicador compacto;
- formulários usam uma coluna;
- tabelas devem ter alternativa mobile;
- upload deve funcionar por touchscreen.

## Dashboard por perfil

### Consultor

- minhas solicitações;
- rascunhos;
- pendências;
- devolvidas;
- em análise;
- concluídas.

### Gerente

- aguardando análise;
- devolvidas;
- encaminhadas ao crédito;
- filtros por consultor, cliente, data, status e valor.

### Crédito

- fila de análise;
- pendências;
- tempo parado;
- valor;
- cliente;
- gerente.

## Timeline

Toda solicitação deve possuir timeline:

- criação;
- envio;
- análise;
- devolução;
- correção;
- aprovação;
- assinatura;
- conclusão.

## Devolução

Modal/painel obrigatório:

- motivo;
- responsável;
- data;
- etapa destino.

O motivo deve permanecer no histórico.

## Estados de interface

Implementar:

- loading;
- skeleton quando adequado;
- empty state;
- erro;
- sucesso;
- confirmação;
- estado offline quando aplicável.

## Acessibilidade

Considerar WCAG:

- teclado;
- foco;
- labels;
- contraste;
- mensagens acessíveis;
- aria quando necessário;
- não depender apenas de cor.
