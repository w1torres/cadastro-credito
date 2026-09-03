# Requisitos — Fase 0

Refinamento dos requisitos funcionais RF01–RF11 propostos em `especificacoes_sistema_credito_rural/01-AUDITORIA-E-REQUISITOS.md`, com base no que foi efetivamente encontrado em `projeto_solicitacao_credito_atualizado_v3.html` (ver `docs/PROJECT_AUDIT.md` para a auditoria completa e `docs/FUNCTIONAL-MAP.md` para o mapeamento componente-a-componente).

Regra seguida: nenhuma regra de negócio foi inventada além do que está evidenciado no protótipo ou nas specs 00–03/10–11. Toda regra necessária mas não evidenciada está marcada como `OPEN QUESTION`.

**Atualização (2026-09-03)**: uma rodada de validação com o responsável do projeto resolveu a maior parte das OPEN QUESTIONS originais — as respostas foram incorporadas como `DECISÃO` diretamente nas seções de cada RF abaixo. Três perguntas seguem deliberadamente em aberto ("validar posteriormente"); ver o "Consolidado de OPEN QUESTIONS desta fase" ao final deste documento para o status completo.

## RF01 — Cliente

Cadastrar, consultar e editar cliente conforme permissões.

Campos identificados no protótipo (Seção 1 "DADOS DO CLIENTE", linhas 73–144, e Seção 4 "ATUALIZAÇÃO CADASTRAL", linhas 270–298):

- Nome / Razão Social (texto)
- CPF / CNPJ (texto, sem máscara/validação no protótipo)
- Nome do Cônjuge (texto, opcional aparente — sem `required`)
- Telefone (`type="tel"`)
- E-mail (`type="email"`)
- Endereço Residencial/Comercial (texto)
- Município (texto)
- UF (texto, `maxlength="2"`)
- CEP (texto)
- "Tem sócio?" (sim/não — controla exibição do bloco de sócios, RF02)
- Informações relevantes sobre o cliente (textarea livre)
- Facilidade em obter informações cadastrais (sim/não)
- Tempo na atividade (select: "+10 anos", "05 a 10 anos", "03 a 05 anos", "Menos de 03 anos")
- Possui referência comercial em outras revendedoras (sim/não + texto livre de referências/contatos)

`DECISÃO` (validada com o responsável do projeto em 2026-09-03): não é necessário um campo explícito de tipo de cliente (PF/PJ) — a distinção é feita por validação do formato do documento (CPF = 11 dígitos → Pessoa Física; CNPJ = 14 dígitos → Pessoa Jurídica), sem campo dedicado no schema. Isso também resolve a OQ-A7 da auditoria. **Consequência para RF05**: como não há campo de tipo de cliente, a exigência dos 9 tipos de documento não pode ser condicionada a PF/PJ por esse campo — ver decisão de RF05 abaixo (documentos permanecem uniformes/obrigatórios para todos).

`DECISÃO` (2026-09-03): não existe uma matriz fixa de permissão de edição por campo/papel. A edição de dados do cliente é liberada conforme o estado de devolução (workflow) apontar informação ou documento faltante — ou seja, quando a solicitação retorna (RF08) a um papel anterior por pendência, esse papel pode editar os itens sinalizados como pendentes. Este princípio geral também orienta RF07 (bloqueio de avanço mostrando pendências, decidido abaixo) e RF08 (motivo de devolução). Detalhamento fino (ex.: se a edição fica restrita apenas aos campos marcados como pendentes ou libera o registro inteiro) fica para a Fase 2/3, ao desenhar o `WorkflowService` e as permissões (guards) do NestJS.

## RF02 — Proprietários/Sócios

Permitir múltiplas pessoas relacionadas ao cliente.

Comportamento identificado (bloco `sociosArea`/`sociosContainer`, linhas 130–138; template `addSocio()`, linhas 460–481):

- Bloco só aparece se "Tem sócio? = SIM" (rádio `possuiSocio`, linha 125).
- Repetível 0..N vezes via botão "ADICIONAR SÓCIO"; cada item pode ser removido individualmente e a lista é renumerada (`renumerarSocios()`, linha 483).
- Campos por sócio: Nome do Sócio, CPF/CNPJ, Telefone, E-mail, Endereço.

`DECISÃO` (2026-09-03): sim, é intencional — um sócio segue a mesma lógica de PF/PJ do cliente (CPF ou CNPJ, distinguido por formato, sem campo de tipo dedicado). Resolve a OQ-A6 da auditoria.

`DECISÃO` (2026-09-03): não há limite máximo de sócios por cliente.

## RF03 — Propriedades

Permitir múltiplas propriedades.

Comportamento identificado (container `fazendasContainer`, linhas 258–267; template `addFazenda()`, linhas 490–609):

- Campos por propriedade: Nome da Fazenda, Inscrição Estadual, Município, UF, Localidade/Região, Latitude, Longitude, Área Própria (ha), Área Arrendada (ha), Área Irrigada (ha).
- Repetível via botão "ADICIONAR FAZENDA"; cada fazenda além da primeira pode ser removida (`removerFazenda()`, linha 611) e a lista é renumerada (`renumerarFazendas()`, linha 616).
- A primeira fazenda é criada automaticamente ao carregar a página (comentário "Primeira fazenda obrigatória", linha 765) e nunca recebe botão de remoção (condicional `numero > 1`, linha 504).

`DECISÃO` (2026-09-03, resolve OQ-A2 da auditoria): confirmado como regra de negócio real — toda solicitação exige no mínimo 1 propriedade cadastrada. A validação (bloqueio de remoção da última propriedade / exigência de ao menos uma para submeter) deve ser aplicada no backend, não apenas na UI.

## RF04 — Produção

Permitir dados produtivos por propriedade/safra.

Estrutura identificada dentro de cada card de fazenda (linhas 564–604, `showCropTab()` linhas 623–634), organizada em 3 abas:

- **1ª Safra** ("verão"): Soja, Milho Verão, Feijão Verão — cada um em hectares.
- **2ª Safra** ("safrinha"): Milho Safrinha, Sorgo, Feijão 2ª Safra — cada um em hectares.
- **Outras Culturas**: campo de texto livre (sem estrutura de hectare por cultura).

`DECISÃO` (2026-09-03): "Outras Culturas" deve virar uma lista estruturada de (cultura, hectares) — a partir de uma lista pré-definida de culturas — mas com a opção de adicionar uma cultura customizada quando ela não constar na lista pré-definida.

`DECISÃO` (2026-09-03): sim, o modelo precisa de um campo explícito de safra/ano-safra (ex.: "2025/2026"), para validar que os dados de produção lançados correspondem à safra vigente.

## RF05 — Documentos

Permitir anexar, consultar e controlar documentos.

Lista fixa de tipos de documento encontrada (Seção 5, linhas 301–359), cada um com checkbox + `<input type="file">`:

1. Imposto de Renda
2. Documentação Pessoal do Cliente
3. Comprovante de Endereço
4. Contrato Social
5. Certidão de Ônus da Fazenda
6. Contrato de Arrendamento
7. DRE
8. CAR
9. Cópia da Documentação dos Sócios (aceita múltiplos arquivos — `multiple`)

Mais um campo livre "OUTROS DOCUMENTOS / ANEXOS" (múltiplos arquivos, sem tipo pré-definido, linhas 351–356).

Nenhum dos `<input type="file">` define `accept` (tipo/mime) ou limite de tamanho.

`DECISÃO` (2026-09-03): tipos de arquivo aceitos: PDF, JPEG e PNG. Tamanho máximo (por arquivo e total) **ainda não definido** — permanece `OPEN QUESTION` a ser resolvida antes da Fase 5 (Documentos); propor um limite técnico razoável (ex.: 10MB/arquivo) como padrão de implementação sujeito a validação posterior.

`DECISÃO` (2026-09-03): sim, os 9 tipos de documento são sempre obrigatórios para todos os clientes — não variam por tipo de cliente (PF/PJ). Consistente com a decisão de RF01 de não haver campo explícito de tipo de cliente. Resolve a OQ-A4 da auditoria.

`DECISÃO` (2026-09-03): os checkboxes de "aplicável" podem ser removidos — os 9 tipos de documento passam a ser todos obrigatórios (sem distinção opcional/aplicável via checkbox).

## RF06 — Solicitação

Criar e manter solicitação de crédito.

Campos identificados (Seção 2 "SOLICITAÇÃO E ANÁLISE INICIAL", linhas 148–255):

- Limite de Crédito Solicitado (R$, `type="number" step="0.01" min="0"`, campo livre sem teto máximo)
- Plantio em Área Arrendada? (sim/não) → se sim: Hectares de Plantio em Área Arrendada
- Plantio em Área de 1ª Safra? (sim/não)
- Negociação na Modalidade Barter? (sim/não)
- Possui Débitos Renegociados? (sim/não)
- Aquisição de Terras? (sim/não) → se sim: Hectares, Ano, Localidade, Quantidade de Parcelas (`min="1"`)
- Aquisição de Novas Máquinas? (sim/não) → se sim: descrição livre de quais máquinas
- Possui Outra Atividade? (sim/não) → se sim: descrição livre da atividade e dados relevantes

A solicitação está implicitamente vinculada a um único `Client` (não há seleção explícita de cliente na tela — o cliente é preenchido na mesma tela/seção 1). Estado inicial equivalente a `DRAFT` na spec 03.

`DECISÃO` (2026-09-03): não há valor máximo de limite de crédito solicitável, nem faixas por perfil de cliente.

## RF07 — Workflow

Controlar transições por papel e estado.

No protótipo, o "workflow" é inteiramente cosmético e client-side:

- Variável `etapa` (0, 1, 2) mapeada para `etapas = ['Consultor', 'Gerente', 'Crédito']` (linhas 446–447).
- `proximaEtapa()` (linha 691) incrementa `etapa` e atualiza a UI (`atualizarEtapa()`, linha 669) e o histórico — sem validar preenchimento, sem validar papel/autenticação, sem persistência.
- Não há verificação de "quem" pode clicar em ENCAMINHAR — qualquer usuário da página pode fazê-lo a qualquer momento.

Requisito refinado: as transições reais devem seguir a máquina de estados formal de 12 estados definida em `03-DOMINIO-E-WORKFLOW.md` (`DRAFT → SUBMITTED_TO_MANAGER → MANAGER_REVIEW → ... → COMPLETED`, com rotas de devolução), implementada em um `WorkflowService` no backend, validando estado atual e papel do usuário autenticado antes de qualquer transição — nenhuma dessas validações existe hoje no protótipo, é 100% a construir.

`DECISÃO` (2026-09-03): sim, "ENCAMINHAR" deve bloquear o avanço quando houver campos/documentos obrigatórios pendentes, e a UI deve exibir claramente quais pendências impedem o avanço (lista de pendências, não apenas um erro genérico). A lista exata de campos obrigatórios por etapa segue a ser detalhada na Fase 2/4 a partir dos campos já obrigatórios definidos neste documento (ex.: mínimo 1 propriedade, os 9 documentos, etc.).

## RF08 — Devolução

Exigir motivo para divergências.

Comportamento identificado: botão "REPROVAR" (`id="btnReprovar"`, linha 411; oculto quando `etapa === 0`, ou seja, na etapa Consultor) chama `reprovar()` (linha 704), que apenas:

1. Atualiza o texto de status para "Solicitação reprovada pelo {etapa atual}".
2. Adiciona uma linha ao histórico.

Não pede motivo, não identifica responsável (além do papel da etapa atual), não define etapa de destino da devolução, e não reverte `etapa` para um valor anterior.

Requisito refinado (conforme spec 02, seção "Devolução"): a devolução deve exigir modal/painel obrigatório com motivo, responsável, data e etapa destino, e esse motivo deve permanecer no histórico de forma imutável — nenhum desses elementos existe no protótipo hoje.

`OPEN QUESTION` (= OQ-A1 da auditoria; adiada deliberadamente em 2026-09-03 — "validar posteriormente"): a devolução deve necessariamente voltar ao papel imediatamente anterior (GERENTE→CONSULTOR, CRÉDITO→GERENTE), conforme o fluxo da spec 03, ou existe algum caso de devolução direta que pule uma etapa? Enquanto não for validada, a implementação de referência assume apenas devolução ao papel imediatamente anterior (única rota evidenciada na spec 03).

## RF09 — Histórico

Registrar todas as transições.

No protótipo, o histórico (`#historico`, linhas 421–429; `addHistorico()`, linha 636) registra apenas texto livre + timestamp gerado no cliente (`toLocaleString('pt-BR')`) para dois tipos de evento: criação do formulário/limpeza e avanço de etapa. É recriado do zero a cada carregamento da página (sem persistência) e é completamente apagado pelo botão "LIMPAR".

Requisito refinado: o histórico deve ser persistido no backend (`CreditRequestHistory`), imutável (nunca apagado, mesmo por ações de "limpar"/descartar rascunho), e deve cobrir todas as transições reais da máquina de estados (RF07), incluindo motivo/responsável/data/etapa-destino das devoluções (RF08).

## RF10 — Assinatura

Gerar/anexar documento e encaminhar para Clicksign.

No protótipo, a "assinatura" (Seção 7, linhas 381–397) é um canvas HTML5 de desenho livre (mouse/touch, lógica nas linhas 709–762), com botão "LIMPAR ASSINATURA" (linha 392). A assinatura desenhada **nunca é exportada** (`canvas.toDataURL()` não é chamado em nenhum ponto do arquivo) nem enviada a lugar algum — existe apenas visualmente na tela/impressão.

Requisito refinado: o fluxo real (spec 00/07) deve gerar/anexar o documento aprovado, criar uma solicitação de assinatura via `SignatureService`/`ClicksignAdapter`, aguardar webhook de conclusão e atualizar o status da solicitação — o canvas de assinatura manuscrita do protótipo não tem valor jurídico e não deve ser reaproveitado como solução final (apenas confirma que existe uma etapa de "assinatura" no fluxo visual original).

## RF11 — Auditoria

Registrar ações relevantes.

O protótipo não possui nenhum mecanismo de auditoria: não há identificação de usuário autenticado, não há registro de IP/timestamp confiável de servidor, não há log de ações além do histórico de workflow textual (RF09), que também não é persistido.

Requisito refinado: 100% novo, sem base a preservar do protótipo, apoiado nas specs 03/06 (auditoria de transições, acessos a documentos e ações administrativas relevantes).

## Requisitos não funcionais

- **Responsivo**: base de grids Tailwind (`md:grid-cols-*`) existente no protótipo colapsa razoavelmente para 1 coluna, mas não foi testada nos breakpoints pequenos exigidos (320/375/390/414px) — a nova aplicação deve validar formalmente esses breakpoints (spec 02).
- **Acessível**: protótipo hoje tem apenas 1 `aria-label` em todo o documento e labels majoritariamente não pareados a `id`/`for` — a nova aplicação parte de uma base quase zero e deve implementar WCAG básico (teclado, foco, labels, contraste, aria) desde o início.
- **Seguro**: protótipo não tem autenticação, autorização, validação server-side, proteção de upload ou CSP — todos esses controles devem ser construídos do zero no backend (NestJS), nunca confiando em validação client-side isolada.
- **Testável**: não existe nenhum teste hoje — a nova aplicação deve ser estruturada (módulos, serviços isolados como `WorkflowService`/`SignatureService`) para permitir testes unitários, de integração e E2E (spec 09).
- **Observável**: protótipo não tem logs nem telemetria — a nova aplicação deve ter logs estruturados (sem exposição de dados sensíveis) e health checks (spec 10, Fase 8).
- **Modular**: protótipo é um monolito single-file (HTML+CSS+JS misturados); a nova aplicação deve seguir a diretriz de Modular Monolith (ADR-001) com módulos de domínio isolados (clients, properties, credit-requests, workflow, documents, signature).
- **Persistente**: protótipo não persiste nada (refresh apaga tudo); a nova aplicação deve persistir todos os dados de domínio e o histórico de workflow em PostgreSQL (ADR-002), com documentos armazenados fora do banco (princípio 6 do contexto do projeto).
- **Preparado para produção**: protótipo usa Tailwind via CDN "Play" (não recomendado para produção) e possui ~90% do peso do arquivo em uma imagem de logo duplicada em base64 — a nova aplicação deve usar build pipeline real (Vite), assets estáticos versionados e sem duplicação.

## Consolidado de OPEN QUESTIONS desta fase

Rodada de validação com o responsável do projeto em 2026-09-03 — status atualizado:

### Resolvidas (viraram `DECISÃO`, ver seção do RF correspondente)

1. ~~Distinção explícita PF/PJ para o cliente~~ (RF01) — não é necessária, validação por formato de CPF/CNPJ.
2. ~~Permissões exatas de edição do cliente por papel~~ (RF01) — edição segue as pendências indicadas na devolução, não uma matriz fixa campo×papel.
3. ~~Sócio pode ser pessoa jurídica?~~ (RF02) — sim, mesma lógica de CPF/CNPJ.
4. ~~Limite máximo de sócios?~~ (RF02) — não há limite.
5. ~~"Mínimo 1 propriedade por solicitação" é regra de negócio real?~~ (RF03) — sim, confirmado.
6. ~~"Outras Culturas" estruturado ou texto livre?~~ (RF04) — lista estruturada + opção de cultura customizada.
7. ~~Falta campo explícito de safra/ano-safra?~~ (RF04) — sim, necessário.
9. ~~O checkbox de documento significa "aplicável" ou "entregue"?~~ (RF05) — removido; os 9 tipos passam a ser todos obrigatórios.
10. ~~Os 9 tipos de documento são sempre exigidos ou variam por tipo de cliente?~~ (RF05) — sempre obrigatórios para todos, não variam.
11. ~~Existe valor máximo de limite de crédito solicitável?~~ (RF06) — não há teto.
12. ~~"ENCAMINHAR" deve bloquear avanço por pendências?~~ (RF07) — sim, e deve exibir a lista de pendências.

### Parcialmente resolvidas

8. Tipos de arquivo e tamanho máximo de upload (RF05) — mime types definidos (PDF/JPEG/PNG); **tamanho máximo continua em aberto**.

### Ainda em aberto (adiadas deliberadamente pelo responsável em 2026-09-03, "validar posteriormente")

13. Devolução sempre volta ao papel imediatamente anterior, ou há casos de pular etapa? (RF08).
14. Os pareceres (Consultor/Gerente/Crédito) devem ficar bloqueados para edição fora da etapa/papel correspondente? (OQ-A3 da auditoria, ver `PROJECT_AUDIT.md`).

Estas 2 pendências devem ser revisitadas antes de fechar o desenho definitivo do `WorkflowService` na Fase 2.

Todas as demais regras aplicadas neste documento decorrem diretamente do que foi observado no HTML (citado com número de linha) ou do texto das specs 00, 02, 03 e 10–11.
