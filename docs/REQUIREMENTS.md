# Requisitos — Fase 0

Refinamento dos requisitos funcionais RF01–RF11 propostos em `especificacoes_sistema_credito_rural/01-AUDITORIA-E-REQUISITOS.md`, com base no que foi efetivamente encontrado em `projeto_solicitacao_credito_atualizado_v3.html` (ver `docs/PROJECT_AUDIT.md` para a auditoria completa e `docs/FUNCTIONAL-MAP.md` para o mapeamento componente-a-componente).

Regra seguida: nenhuma regra de negócio foi inventada além do que está evidenciado no protótipo ou nas specs 00–03/10–11. Toda regra necessária mas não evidenciada está marcada como `OPEN QUESTION`.

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

`OPEN QUESTION`: o protótipo não distingue explicitamente Pessoa Física de Pessoa Jurídica (apenas um campo combinado "Nome/Razão Social" + "CPF/CNPJ"). É necessário um campo de tipo de cliente explícito no sistema real? (relevante também para RF05, ver OQ abaixo).

`OPEN QUESTION`: quais permissões exatas de edição por papel (CONSULTOR/GERENTE/CRÉDITO) aplicam-se ao cadastro do cliente? O protótipo não implementa nenhum controle de acesso — qualquer campo é editável por qualquer pessoa a qualquer momento.

## RF02 — Proprietários/Sócios

Permitir múltiplas pessoas relacionadas ao cliente.

Comportamento identificado (bloco `sociosArea`/`sociosContainer`, linhas 130–138; template `addSocio()`, linhas 460–481):

- Bloco só aparece se "Tem sócio? = SIM" (rádio `possuiSocio`, linha 125).
- Repetível 0..N vezes via botão "ADICIONAR SÓCIO"; cada item pode ser removido individualmente e a lista é renumerada (`renumerarSocios()`, linha 483).
- Campos por sócio: Nome do Sócio, CPF/CNPJ, Telefone, E-mail, Endereço.

`OPEN QUESTION`: o rótulo "CPF/CNPJ" no sócio sugere que um sócio pode ser pessoa jurídica — confirmar se isso é intencional.

`OPEN QUESTION`: não há limite máximo de sócios no protótipo — existe um limite de negócio?

## RF03 — Propriedades

Permitir múltiplas propriedades.

Comportamento identificado (container `fazendasContainer`, linhas 258–267; template `addFazenda()`, linhas 490–609):

- Campos por propriedade: Nome da Fazenda, Inscrição Estadual, Município, UF, Localidade/Região, Latitude, Longitude, Área Própria (ha), Área Arrendada (ha), Área Irrigada (ha).
- Repetível via botão "ADICIONAR FAZENDA"; cada fazenda além da primeira pode ser removida (`removerFazenda()`, linha 611) e a lista é renumerada (`renumerarFazendas()`, linha 616).
- A primeira fazenda é criada automaticamente ao carregar a página (comentário "Primeira fazenda obrigatória", linha 765) e nunca recebe botão de remoção (condicional `numero > 1`, linha 504).

`OPEN QUESTION` (mesma da auditoria, OQ-A2): a impossibilidade de remover a fazenda #1 é uma regra de negócio real ("toda solicitação precisa de ao menos 1 propriedade") ou apenas um detalhe de implementação do protótipo? Está sendo registrada aqui como requisito candidato ("mínimo 1 propriedade por solicitação"), não confirmado.

## RF04 — Produção

Permitir dados produtivos por propriedade/safra.

Estrutura identificada dentro de cada card de fazenda (linhas 564–604, `showCropTab()` linhas 623–634), organizada em 3 abas:

- **1ª Safra** ("verão"): Soja, Milho Verão, Feijão Verão — cada um em hectares.
- **2ª Safra** ("safrinha"): Milho Safrinha, Sorgo, Feijão 2ª Safra — cada um em hectares.
- **Outras Culturas**: campo de texto livre (sem estrutura de hectare por cultura).

`OPEN QUESTION`: "Outras Culturas" é só texto livre no protótipo — o sistema real deveria estruturar isso como lista de (cultura, hectares), ou o texto livre é suficiente/definitivo?

`OPEN QUESTION`: não há campo de identificação de safra/ano-safra (ex.: "Safra 2025/2026") no protótipo — a produção é implicitamente "da próxima safra" (rótulo da seção: "ÁREA DE PRODUÇÃO PARA A PRÓXIMA SAFRA", linha 566). O modelo de dados real precisa de um campo explícito de safra/ano?

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

`OPEN QUESTION`: quais tipos de arquivo (mime) e tamanho máximo (por arquivo e total) serão aceitos? Não evidenciado no protótipo nem nas specs 00–03/10–11 lidas nesta fase.

`OPEN QUESTION`: os 9 tipos são sempre exigidos, ou variam conforme o tipo de cliente (ex.: "Contrato Social" só se aplicaria a Pessoa Jurídica — ver RF01)? O protótipo sempre exibe os 9, sem condicional.

`OPEN QUESTION`: o checkbox ao lado de cada tipo de documento marca "documento aplicável" ou "documento entregue"? O protótipo não deixa claro (não há texto de ajuda) — comportamento atual é apenas um checkbox solto sem vínculo funcional com o campo de upload ao lado.

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

`OPEN QUESTION`: existe valor máximo de limite de crédito solicitável, ou faixas por perfil de cliente? Não evidenciado.

## RF07 — Workflow

Controlar transições por papel e estado.

No protótipo, o "workflow" é inteiramente cosmético e client-side:

- Variável `etapa` (0, 1, 2) mapeada para `etapas = ['Consultor', 'Gerente', 'Crédito']` (linhas 446–447).
- `proximaEtapa()` (linha 691) incrementa `etapa` e atualiza a UI (`atualizarEtapa()`, linha 669) e o histórico — sem validar preenchimento, sem validar papel/autenticação, sem persistência.
- Não há verificação de "quem" pode clicar em ENCAMINHAR — qualquer usuário da página pode fazê-lo a qualquer momento.

Requisito refinado: as transições reais devem seguir a máquina de estados formal de 12 estados definida em `03-DOMINIO-E-WORKFLOW.md` (`DRAFT → SUBMITTED_TO_MANAGER → MANAGER_REVIEW → ... → COMPLETED`, com rotas de devolução), implementada em um `WorkflowService` no backend, validando estado atual e papel do usuário autenticado antes de qualquer transição — nenhuma dessas validações existe hoje no protótipo, é 100% a construir.

`OPEN QUESTION`: o botão "ENCAMINHAR" deveria bloquear o avanço se campos obrigatórios da etapa não estiverem preenchidos? O protótipo não bloqueia (nem define quais campos seriam obrigatórios em cada etapa).

## RF08 — Devolução

Exigir motivo para divergências.

Comportamento identificado: botão "REPROVAR" (`id="btnReprovar"`, linha 411; oculto quando `etapa === 0`, ou seja, na etapa Consultor) chama `reprovar()` (linha 704), que apenas:

1. Atualiza o texto de status para "Solicitação reprovada pelo {etapa atual}".
2. Adiciona uma linha ao histórico.

Não pede motivo, não identifica responsável (além do papel da etapa atual), não define etapa de destino da devolução, e não reverte `etapa` para um valor anterior.

Requisito refinado (conforme spec 02, seção "Devolução"): a devolução deve exigir modal/painel obrigatório com motivo, responsável, data e etapa destino, e esse motivo deve permanecer no histórico de forma imutável — nenhum desses elementos existe no protótipo hoje.

`OPEN QUESTION` (= OQ-A1 da auditoria): a devolução deve necessariamente voltar ao papel imediatamente anterior (GERENTE→CONSULTOR, CRÉDITO→GERENTE), conforme o fluxo da spec 03, ou existe algum caso de devolução direta que pule uma etapa? A spec 03 não evidencia esse segundo caso, então o requisito assume apenas devolução ao papel imediatamente anterior.

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

1. Distinção explícita PF/PJ para o cliente (RF01).
2. Permissões exatas de edição do cliente por papel (RF01).
3. Sócio pode ser pessoa jurídica? (RF02)
4. Limite máximo de sócios? (RF02)
5. "Mínimo 1 propriedade por solicitação" é regra de negócio real ou detalhe de protótipo? (RF03)
6. "Outras Culturas" deve ser estruturado (cultura + hectares) ou texto livre é definitivo? (RF04)
7. Falta campo explícito de safra/ano-safra na produção — necessário no modelo real? (RF04)
8. Tipos de arquivo e tamanho máximo de upload de documentos? (RF05)
9. Os 9 tipos de documento são sempre exigidos ou variam por tipo de cliente? (RF05)
10. O checkbox de documento significa "aplicável" ou "entregue"? (RF05)
11. Existe valor máximo de limite de crédito solicitável? (RF06)
12. "ENCAMINHAR" deve bloquear avanço por campos obrigatórios não preenchidos, e quais seriam esses campos por etapa? (RF07)
13. Devolução sempre volta ao papel imediatamente anterior, ou há casos de pular etapa? (RF08)

Todas as demais regras aplicadas neste documento decorrem diretamente do que foi observado no HTML (citado com número de linha) ou do texto das specs 00, 02, 03 e 10–11.
