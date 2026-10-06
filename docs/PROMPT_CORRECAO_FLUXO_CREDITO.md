# Prompt: corrigir inconsistências do fluxo de solicitação (cadastro-credito)

Leia também `PROMPT_AJUSTES_FLUXO_PROD.md` (contexto, máquina de estados, regras já implementadas, ambiente). Este prompt trata das inconsistências que ainda aparecem no fluxo local. Leia os dois arquivos inteiros antes de alterar código.

## 1. Sintoma principal (reproduzível localmente)

Quando a solicitação é devolvida com pendência de documento (CREDITO → GERENTE, ou GERENTE → CONSULTOR), o usuário que recebeu a devolução **não consegue acessar a ficha/cadastro do cliente para corrigir ou adicionar informações e documentos**, nem pelo perfil CONSULTOR nem pelo perfil GERENTE.

Esperado: quem recebeu a devolução com pendência consegue abrir o cadastro (tela de edição da solicitação/cliente), ajustar dados e anexar o documento pendente, e depois reenviar.

## 2. Regra de trabalho

Siga o método de troubleshooting: SINTOMA → EVIDÊNCIA → HIPÓTESE → TESTE → CAUSA → CORREÇÃO → VALIDAÇÃO → PREVENÇÃO.

- Antes de alterar qualquer coisa, reproduza o problema e descreva a causa com evidência (arquivo, linha, resposta HTTP, log). Não corrija por palpite.
- Altere somente o necessário. Não reescreva componentes que funcionam.
- Preserve a máquina de estados em `backend/src/credit-requests/workflow.types.ts` como fonte única das regras.
- Não altere regra de negócio sem confirmação. Onde faltar definição, liste a suposição e a pergunta, e avance com a suposição mais conservadora identificada como tal.

## 3. Investigação obrigatória (nesta ordem)

Para cada item, registre o que encontrou antes de corrigir.

1. **Frontend – visibilidade da ação de editar**
   - Em `CreditRequestDetailPage.tsx` e `PendenciasDocumentosCard.tsx`: existe botão/link para abrir o cadastro (`EditClientRequestPage.tsx`)? Em quais condições aparece (status, perfil, dono da solicitação)?
   - Hipótese: o botão só aparece em `DRAFT` e fica oculto em `RETURNED_TO_CONSULTANT` e `RETURNED_TO_MANAGER`/`MANAGER_REVIEW`. Como a visão do consultor esconde o status, verificar se a condição depende de um status que o consultor não recebe.
2. **Frontend – rota e guarda**
   - Em `App.tsx` e `Sidebar.tsx`: a rota de edição tem guarda por perfil ou status que bloqueia CONSULTOR/GERENTE nos estados de devolução?
   - `EditClientRequestPage.tsx` redireciona, desabilita campos ou mostra somente leitura em algum status?
3. **Backend – permissão de edição**
   - No controller/serviço de `credit-requests`: o endpoint de atualização de dados do cliente/solicitação (PATCH/PUT) recusa edição por status ou por perfil? Qual é a resposta (403/409/400) e a mensagem?
   - Verificar o filtro por dono (consultor) e por filial (gerente): o gerente enxerga e pode editar solicitações da própria filial? O consultor continua sendo reconhecido como dono após a devolução?
4. **Backend – upload de documento**
   - `DocumentsService.upload`: permite anexar nos estados `RETURNED_TO_CONSULTANT` e `RETURNED_TO_MANAGER` e para o perfil GERENTE? Anexar tipo pendente remove a pendência em todos esses casos?
5. **Dados da devolução**
   - Ao devolver com `pendencias`, as pendências são gravadas e retornadas para o perfil de destino (consultor vê tipo + motivo; gerente também na devolução do crédito)?
   - O `targetStatus` e o status resultante estão corretos (CREDITO → `RETURNED_TO_MANAGER`; GERENTE → `RETURNED_TO_CONSULTANT`)?

## 4. Comportamento alvo (matriz de edição)

Suposição a confirmar com o negócio (marcar como suposição no relatório final):

| Status | CONSULTOR (dono) | GERENTE (filial) | CREDITO |
|---|---|---|---|
| DRAFT | edita cadastro e anexa documentos | não | não |
| RETURNED_TO_CONSULTANT | edita cadastro e anexa documentos pendentes | somente leitura | não |
| SUBMITTED_TO_MANAGER / MANAGER_REVIEW | somente leitura | revisa, marca pendências/ficha; edita cadastro e anexa documentos se a regra permitir | somente leitura |
| RETURNED_TO_MANAGER | somente leitura | edita cadastro e anexa documentos pendentes | somente leitura |
| SUBMITTED_TO_CREDIT / CREDIT_REVIEW | somente leitura | somente leitura | analisa, devolve, aprova/reprova |
| APPROVED / REJECTED | somente leitura | somente leitura | somente leitura |

Implementação sugerida: centralizar a permissão de edição em uma função única (por exemplo `canEditCadastro(status, perfil)`) no backend em `workflow.types.ts`, espelhada no frontend em `src/lib/workflow.ts`, para que botão, rota e API usem a mesma regra. Evitar duplicar condições espalhadas nos componentes.

## 5. Correções esperadas

1. Exibir, na tela de detalhe, a ação "Editar cadastro" (ou equivalente) para quem tem permissão conforme a matriz, com destaque quando houver pendência.
2. Liberar a rota/tela de edição para esses perfis e status, mostrando em modo somente leitura nos demais casos (com motivo claro).
3. Backend: permitir atualização de dados e upload de documento nos estados e perfis da matriz; recusar com mensagem clara nos demais. Validar propriedade (consultor dono, gerente da filial).
4. Após anexar o documento de um tipo pendente, a pendência desaparece e o botão de reenvio é liberado (consultor: "Enviar para gerente"; gerente: "Enviar para crédito", respeitando o gate de ficha APROVADA e zero pendências).
5. Mensagem de bloqueio no próprio botão de envio explicando o motivo (pendência, ficha não aprovada, assinatura SPC/Bacen se a regra for mantida).

## 6. Outras inconsistências a verificar na mesma passada

Reproduza cada uma, registre o resultado e corrija somente o que estiver quebrado:

- P1 (assinatura SPC/Bacen): confirmar com o negócio se bloqueia o envio ao gerente ou só a análise de crédito. Não assumir. Para teste local, `CLICKSIGN_MOCK=true` apenas fora de produção.
- P2: botão do consultor espelha a regra do backend (pendências e assinatura).
- P3: fila do gerente só com a filial dele; filtros por consultor e status.
- P4: modal de devolução do crédito com destino único (gerente), botão "Devolver ao gerente", e lista de `pendencias` que substitui as atuais.
- Visão do consultor: mostra pendências e situação da ficha; continua escondendo status e histórico (a correção não deve expor o status).

## 7. Testes (Vitest, backend)

Criar ou ampliar testes de serviço cobrindo:

- Consultor: edição de cadastro e upload permitidos em `DRAFT` e `RETURNED_TO_CONSULTANT`; negados nos demais estados e para outro consultor.
- Gerente: edição e upload permitidos em `RETURNED_TO_MANAGER` (e em `MANAGER_REVIEW` conforme a matriz); negado para gerente de outra filial.
- Upload de documento de tipo pendente remove a pendência.
- Consultor não envia com pendência; gerente não envia ao crédito com pendência ou ficha não aprovada.
- Crédito devolve somente ao gerente (`targetStatus` de consultor é recusado) e a devolução grava as pendências.

## 8. Validação manual (após corrigir)

Fluxo completo com usuários de teste:

1. CONSULTOR cria solicitação, anexa documentos, envia ao gerente.
2. GERENTE revisa, marca pendência de um documento, devolve ao consultor.
3. CONSULTOR abre o cadastro, ajusta dados, anexa o documento; pendência some; reenvia.
4. GERENTE aprova a ficha, sem pendências, envia ao crédito.
5. CREDITO devolve ao gerente com pendência de documento.
6. GERENTE abre o cadastro, ajusta/anexa, pendência some, reenvia ao crédito.
7. CREDITO aprova.

Em cada etapa, confirmar botões, mensagens de bloqueio e o que cada perfil enxerga.

## 9. Entrega

Ao final, rodar `npm test` no backend, `npx tsc -b` e `npm run build` no frontend. Responder com:

- causa raiz encontrada, com evidência (arquivo e trecho);
- arquivos alterados e o motivo de cada alteração;
- suposições feitas e perguntas pendentes para o negócio;
- resultado dos testes e da validação manual;
- riscos e impacto em produção (nenhuma migração nova esperada; se surgir, descrever, manter aditiva e informar rollback).
