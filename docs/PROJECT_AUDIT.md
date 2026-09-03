# Auditoria Técnica — Fase 0

Auditoria do repositório `cadastro-credito` e do protótipo `projeto_solicitacao_credito_atualizado_v3.html` (445 KB, 770 linhas), realizada antes de qualquer refatoração, conforme `especificacoes_sistema_credito_rural/01-AUDITORIA-E-REQUISITOS.md`.

O arquivo inteiro foi lido (offsets 1–35, 37–272, 274–770; as linhas 36 e 273 foram inspecionadas por amostragem via `sed`/`grep` por conterem ~201 KB cada de uma mesma imagem em base64 — ver seção "Código morto / duplicado"). Também foram inspecionados: histórico git (`git log`), listagem de arquivos do repositório e buscas por padrões (`<form`, `required`, `fetch(`, `localStorage`, `id="`, `aria-`, etc.).

## 1. Estado do repositório

- Repositório com um único commit (`9137d54 — Commit inicial: protótipo HTML e pacote de especificações...`), working tree limpo.
- Estrutura de diretórios é **plana**: não há `src/`, não há `package.json`, não há build tooling, não há testes. Arquivos existentes:
  - `CLAUDE.md`
  - `especificacoes_sistema_credito_rural/*.md` (13 arquivos de spec + README)
  - `projeto_solicitacao_credito_atualizado_v3.html` (o protótipo)
- Não há nenhum outro artefato de código (sem `.js`, `.css`, imagens soltas, etc.) — tudo está embutido no único HTML.

## 2. Stack atual

- HTML5 puro (`<!DOCTYPE html>`, `lang="pt-BR"`), sem nenhum framework front-end (sem React/Vue/Angular).
- CSS: Tailwind CSS carregado via **Play CDN** (`<script src="https://cdn.tailwindcss.com"></script>`, linha 7) — a própria documentação do Tailwind desaconselha esse modo para produção (compilação JIT no navegador, sem purge, sem cache versionado). Complementado por um bloco `<style>` inline (linhas 9–27) com ~15 regras customizadas (cores de marca, estados `.stage`, `.conditional`, canvas de assinatura, `@media print`).
- Ícones: Font Awesome 6.5.1 via CDN (`cdnjs.cloudflare.com`, linha 8).
- JavaScript: vanilla JS, um único bloco `<script>` (linhas 443–768, ~326 linhas), sem módulos, sem bundler, sem TypeScript.
- Nenhuma dependência instalada via npm/yarn — zero `package.json`.
- Nenhum atributo `integrity`/`crossorigin` nos `<script>`/`<link>` externos (linhas 7–8) — sem proteção de integridade de subrecurso (SRI).

## 3. Estrutura interna do HTML

Documento de página única (sem `<form>` — confirmado por busca, zero ocorrências de `<form`), organizado em seções sequenciais dentro de `<div class="p-8 space-y-10">` (linha 51):

| Ordem | Seção (título exibido) | Linhas | Observação |
|---|---|---|---|
| — | Cabeçalho (logo + título + campo DATA) | 32–49 | logo em base64 duplicado (linha 36) |
| — | "ETAPA DA SOLICITAÇÃO" (stepper visual) | 54–70 | 3 estágios: Consultor/Gerente/Crédito |
| 1 | "DADOS DO CLIENTE" | 73–145 | inclui bloco condicional de sócios |
| 2 | "SOLICITAÇÃO E ANÁLISE INICIAL" | 148–255 | limite de crédito + 4 blocos condicionais |
| 3 | "DADOS DA FAZENDA E PRODUÇÃO" | 258–267 | container vazio, populado via JS (`addFazenda`) |
| 4 | "ATUALIZAÇÃO CADASTRAL" (comportamento) | 270–298 | segundo logo em base64 duplicado (linha 273) |
| 5 | "DOCUMENTOS E ANEXOS" | 301–359 | 9 checkboxes+upload fixos + upload livre |
| 6 | "PARECERES DO WORKFLOW" | 362–378 | 3 textareas (Consultor/Gerente/Crédito) |
| 7 | "ASSINATURA" | 381–397 | canvas de assinatura manuscrita |
| — | "CONTROLE" (ações de workflow + histórico) | 400–430 | botões LIMPAR/REPROVAR/ENCAMINHAR |
| — | Rodapé (razão social + botão IMPRIMIR) | 434–440 | `window.print()` |
| — | `<script>` | 443–768 | toda a lógica JS |

Não existe nenhum wizard/stepper real de navegação de dados — todas as 7 seções ficam visíveis simultaneamente em uma única rolagem. O único "stepper" de fato é o indicador visual de 3 estágios do workflow (Consultor/Gerente/Crédito), que é puramente cosmético.

## 4. Estado local em JS

Variáveis globais (linhas 446–448):

```js
let etapa = 0;
const etapas = ['Consultor', 'Gerente', 'Crédito'];
let contadorFazendas = 0;
```

Isso é **todo** o "estado" da aplicação. Não existe nenhum objeto de domínio (`cliente`, `socios[]`, `fazendas[]`, `documentos[]`) em memória — os dados digitados pelo usuário vivem exclusivamente no DOM (`value` dos inputs) e nunca são lidos de volta por nenhuma função JS.

Confirmação: os ~37 campos de texto/número/e-mail/telefone (`<input type="text|number|email|tel">`) **não possuem `id` nem `name`** (busca por `id="[a-zA-Z]` só retorna elementos estruturais como `stage-*`, `sociosContainer`, `fazendasContainer`, `signatureCanvas`, `historico`, etc. — nenhum campo de dado de negócio). Os grupos de rádio têm `name` (`possuiSocio`, `arrendada`, `primeiraSafra`, `barter`, `renegociado`, `aquisicaoTerras`, `maquinas`, `outraAtividade`, `cadastro`, `referencia`), mas nenhum desses valores é lido pelo JS além dos quatro que disparam `toggle(...)` para mostrar/ocultar blocos condicionais (`arrendada`, `aquisicaoTerras`, `maquinas`, `outraAtividade`, `possuiSocio`).

Não há `fetch(`, `XMLHttpRequest`, `localStorage` ou `sessionStorage` em nenhum ponto do arquivo (confirmado por busca) — ou seja, **nenhum dado é enviado, salvo ou recuperado**; um refresh de página apaga tudo, inclusive o histórico de workflow.

## 5. Dados mockados

Praticamente não há dados mockados fixos, exceto:

- Campo `data` pré-preenchido com `new Date()` (linha 444).
- Rádio `possuiSocio` com `checked` padrão em "NÃO" (linha 126).
- Texto inicial do histórico: "Solicitação criada — Consultor" com `id="horaCriacao"` = "agora" (linhas 424–427), que nunca é substituído por um valor real (não há código que atualize `#horaCriacao`).
- Uma fazenda é sempre criada automaticamente ao carregar a página (comentário "Primeira fazenda obrigatória", linha 765, chamando `addFazenda()`), e essa fazenda #1 nunca recebe botão de remoção (`numero > 1 ? botão remover : ''`, linha 504) — ver OPEN QUESTION A2.

## 6. Validações existentes

Praticamente inexistentes:

- Zero atributos `required` em todo o documento.
- Apenas dois `maxlength="2"` (campos UF, linhas 114 e 529) — sem validação de sigla de UF válida.
- `min="0"` em campos de hectare/valor e `min="1"` em "QUANTIDADE DE PARCELAS" (linha 223) — apenas restrição nativa do `<input type="number">`, sem mensagem de erro.
- Tipos de input (`email`, `tel`, `date`, `number`) fornecem apenas dicas nativas do navegador, sem máscara de CPF/CNPJ, CEP, telefone ou moeda (BRL).
- Nenhum `pattern`, nenhum `novalidate`/validação de formulário (aliás não há `<form>`), nenhuma mensagem de erro em nenhum lugar do arquivo.
- O botão "ENCAMINHAR" (`proximaEtapa()`, linha 691) avança o workflow **sem nenhuma validação de preenchimento** — é possível avançar da etapa Consultor até Crédito com o formulário inteiro vazio.

## 7. Componentes reutilizáveis (candidatos a componentização)

Identificados por padrões repetidos no HTML/JS:

- **Card de Fazenda/Propriedade** — template gerado via `innerHTML` em `addFazenda()` (linhas 490–609), com sub-abas de cultura (`showCropTab`, linhas 623–634). Candidato a `<PropertyFieldArray>` + `<CropTabs>`.
- **Card de Sócio** — template gerado via `innerHTML` em `addSocio()` (linhas 460–481). Candidato a `<PartnerFieldArray>`.
- **Bloco condicional** — padrão `.conditional` + classe `.show` controlado por `toggle(id, show)` (linha 450), usado 5x (`sociosArea`, `dadosPlantioArrendado`, `dadosTerras`, `dadosMaquinas`, `dadosOutraAtividade`). Candidato a componente genérico dirigido por `watch()` do React Hook Form.
- **Item de documento** (checkbox + `<input type="file">`) — repetido 9x na seção 5 (linhas 313–348). Candidato a `<DocumentUploadItem type=... required=...>`.
- **Bloco de parecer** (`<textarea>` com rótulo por papel) — repetido 3x (linhas 365–376). Candidato a `<OpinionField role=... />`.
- **Pílula de estágio do workflow** (`.stage`) — repetida 3x (linhas 57–65). Candidato a `<WorkflowStepper />`.
- **Cabeçalho de seção com gradiente** (`.section-header`) — repetido em todas as 7 seções numeradas. Candidato a `<SectionCard title=... />`.

## 8. Fluxos de navegação

- Não há wizard real de preenchimento — é uma página única e longa (viola a diretriz da spec 02, que pede 8 etapas: Cliente, Sócios, Solicitação, Propriedades, Produção, Documentos, Revisão, Envio).
- O único fluxo de "navegação" implementado é o avanço linear do indicador de 3 estágios (`proximaEtapa()`), sem retorno real ao estágio anterior: `reprovar()` (linha 704) só troca o texto de status e adiciona uma linha ao histórico — **não decrementa `etapa`**, não define destino, não pede motivo.
- Não existe conceito de autenticação/sessão/papel de usuário logado: qualquer pessoa que abra a página pode clicar em ENCAMINHAR ou REPROVAR, independentemente de qual "papel" ela realmente exerce. O comentário nas linhas 682–684 documenta a intenção ("Consultor = LIMPAR + ENCAMINHAR. Gerente/Crédito = LIMPAR + REPROVAR + ENCAMINHAR"), mas isso é só a exibição condicional do botão REPROVAR (`btnReprovar.hidden` quando `etapa === 0`), não um controle de acesso real.
- "LIMPAR" (`limparFormulario()`, linha 644) apaga **todo** o formulário — inputs, checkboxes, radios, todas as fazendas exceto recriar uma vazia, e todo o histórico — sem nenhuma confirmação/diálogo.

## 9. Entidades manipuladas (visão detalhada)

Ver `docs/FUNCTIONAL-MAP.md` para o mapeamento completo protótipo → arquitetura alvo. Resumo dos campos encontrados por entidade está também em `docs/REQUIREMENTS.md` (RF01–RF06).

## 10. Problemas de segurança

- **Sem autenticação/autorização real**: qualquer usuário do navegador pode operar todas as ações de workflow (ver seção 8). Não há verificação de papel no cliente nem, obviamente, no servidor (não existe servidor).
- **CDNs externos sem SRI**: `cdn.tailwindcss.com` (linha 7) e `cdnjs.cloudflare.com` (linha 8) carregados sem `integrity`/`crossorigin` — risco de supply-chain se o CDN for comprometido.
- **Tailwind Play CDN em "produção"**: compila CSS via JS no navegador a cada carregamento; não é recomendado pela documentação oficial do Tailwind para uso além de prototipagem.
- **Uploads sem restrição**: todos os `<input type="file">` (9 fixos + 1 livre, seção 5) não têm atributo `accept`, não há limite de tamanho nem tipo — comportamento a não replicar ingenuamente no backend (upload arbitrário é vetor de ataque).
- **Nenhum CSP** (Content-Security-Policy) declarado.
- **Assinatura sem valor probatório**: o canvas de assinatura (linhas 386–389, 710–762) nunca é exportado (`toDataURL()` não é chamado em lugar algum) nem enviado a qualquer lugar — do ponto de vista de segurança/negócio, é apenas um desenho local sem persistência ou hash, reforçando a necessidade de substituição pela integração Clicksign real (spec 07).
- **Dados sensíveis sem máscara**: CPF/CNPJ, dados financeiros (limite de crédito) tratados como texto puro sem qualquer ofuscação visual — irrelevante enquanto for só protótipo local, mas é um padrão a não repetir na tela real (considerar mascaramento e RBAC de visualização, LGPD).

## 11. Problemas de UX

- Formulário único e extenso, sem paginação — dificulta revisão, aumenta risco de erro de preenchimento e contraria o princípio 10 do contexto do projeto ("deve existir revisão antes do envio").
- Nenhuma indicação de campo obrigatório (sem `*`, sem `required`, sem mensagens de erro em lugar nenhum do documento).
- "ENCAMINHAR" avança o workflow mesmo com o formulário inteiro vazio.
- "REPROVAR"/devolução não pede motivo, não indica responsável/etapa destino (contraria RF08 e a spec 02, que exige modal com motivo, responsável, data e etapa destino).
- "LIMPAR" é destrutivo (apaga tudo, inclusive fazendas e histórico) sem diálogo de confirmação.
- Os 3 pareceres (Consultor/Gerente/Crédito) ficam todos editáveis ao mesmo tempo, independente da etapa atual — nada impede preencher o parecer de "Crédito" enquanto o processo ainda está com o Consultor (ver OPEN QUESTION A3).
- Nenhum estado de loading/skeleton/empty/erro/sucesso implementado (esperado, já que não há chamadas de rede).
- Acessibilidade mínima: apenas **1** atributo `aria-label` em todo o arquivo (linha 387, no canvas de assinatura); nenhum outro `aria-*`, nenhum `role`, nenhum `tabindex` customizado. A maioria dos `<label>` não usa `for` pareado com `id` (a maioria dos inputs nem tem `id`), quebrando a associação label↔campo para leitores de tela.

## 12. Problemas de responsividade

- Uso de grids Tailwind responsivos (`md:grid-cols-2/3/4`) que colapsam para 1 coluna abaixo de 768px — boa base, mas não há evidência de teste nos breakpoints menores exigidos pela spec 02 (320/375/390/414px).
- Não há sidebar/drawer no protótipo (é formulário único, sem navegação lateral) — a adaptação "sidebar vira drawer" da spec 02 não tem equivalente hoje para comparar.
- Não há `<table>` no protótipo (produção/documentos usam grids de `<div>`, não tabelas) — a exigência de "alternativa mobile para tabelas" (spec 02) não tem baseline no protótipo; terá que ser desenhada do zero para as futuras telas de listagem/dashboard.
- Abas de cultura ("1ª SAFRA" / "2ª SAFRA" / "OUTRAS CULTURAS", linhas 571–579) usam `flex flex-wrap`; texto do botão "OUTRAS CULTURAS" é o mais longo e pode quebrar em telas de 320px.
- Canvas de assinatura tem altura fixa (`height: 220px`, `#signatureCanvas`) — proporcionalmente maior em telas pequenas; `resizeSignatureCanvas()` só é reacionado pelo evento `resize` da janela (linha 763), que pode não disparar de forma confiável em todas as mudanças de orientação em navegadores mobile.

## 13. Pontos de acoplamento

- HTML, CSS e JS 100% misturados em um único arquivo: `<style>` inline, `<script>` inline, `onclick=`/`onchange=` espalhados em dezenas de elementos (ex.: linhas 125–126, 133, 166–167, 204–205, 233–234, 246–247, 392, 408–416, 468, 505, 571–577). Acoplamento forte entre marcação e comportamento.
- Blocos de "Sócio" e "Fazenda" são criados via `innerHTML` com template strings (linhas 465–479 e 499–606) — não existe nenhuma camada de modelo/objeto JS representando essas entidades; ao migrar, os campos precisam ser extraídos manualmente das strings de template (documentado em `FUNCTIONAL-MAP.md`).
- Identificadores de DOM fazem parte da lógica de exibição condicional (`dadosPlantioArrendado`, `dadosTerras`, `dadosMaquinas`, `dadosOutraAtividade`, `verao-${numero}`, `safrinha-${numero}`, `outras-${numero}`) — mistura apresentação com regra de exibição.
- Dependência total de dois CDNs externos (Tailwind Play CDN, Font Awesome cdnjs) como única fonte de estilo/ícones, sem bundler nem versionamento local.

## 14. Código morto / duplicado

- **Logo duplicado em base64**: a mesma imagem PNG codificada em base64 aparece **duas vezes** no arquivo — linha 36 (logo do cabeçalho, renderizado a `w-56 h-20`) e linha 273 (logo da seção "Atualização Cadastral", renderizado a `h-12`). Os primeiros 300 caracteres de cada string base64 são idênticos (confirmado via `sed`). Juntas, essas duas linhas somam ≈ 403 KB dos ≈ 445 KB do arquivo (**~90% do peso total do arquivo** é essa imagem repetida). Isso deveria ser um único arquivo de imagem estático (ex.: `/assets/logo.png` ou SVG) referenciado por URL, não texto base64 duplicado.
- **Radios sem efeito**: `primeiraSafra`, `barter`, `renegociado`, `cadastro`, `referencia` não têm `onchange` nem qualquer leitura posterior — são puramente decorativos, persistem apenas visualmente até o refresh.
- **`reprovar()` funcionalmente incompleta** (linha 704): só altera o texto de status e adiciona uma linha de histórico; não reverte `etapa`, não pede motivo, não define para onde a solicitação "volta" — o nome sugere uma ação completa de devolução, mas o comportamento real é apenas cosmético.
- **Campos "write-only"**: os ~37 inputs de texto/número/e-mail/telefone sem `id`/`name` recebem digitação do usuário, mas nenhuma função JS jamais lê esse valor de volta (nem para salvar — que não existe — nem para preview/impressão customizada). Do ponto de vista de captura de dados, é estado nunca consumido.
- **`#horaCriacao`**: elemento com texto fixo "agora" (linha 426) que nunca é atualizado por JS.

## 15. Riscos técnicos para a migração

1. **Ausência de modelo de dados explícito**: como os campos não têm `id`/`name` consistentes, o levantamento dos ~90 campos visuais para os schemas Zod/RHF exigiu extração manual campo a campo nesta auditoria (ver `FUNCTIONAL-MAP.md` e `REQUIREMENTS.md`) — risco de omissão em contagens futuras se o protótipo mudar sem nova auditoria.
2. **Reestruturação de UX obrigatória**: a tela única precisa virar um wizard de 8 passos (spec 02); não é um port 1:1 de componente por componente, é um redesenho de fluxo.
3. **Workflow 100% cosmético hoje**: `etapa` é uma variável JS local sem qualquer persistência ou validação de papel — terá que ser reconstruído do zero como máquina de estados no backend (`WorkflowService`, spec 03) com os 12 estados formais e regras de transição; não há regra de negócio real herdável do protótipo além da intenção de 3 papéis em sequência com devoluções.
4. **Sócios e Fazendas via `innerHTML`**: sem tipagem, sem array de estado — terão que virar `useFieldArray` do React Hook Form com componentes controlados.
5. **Canvas de assinatura sem reaproveitamento real**: não exporta nem persiste a assinatura; será substituído pela integração Clicksign (spec 07/00) — o código de desenho a mão livre provavelmente não é reaproveitável na solução final.
6. **Zero validações herdáveis**: todas as regras de validação (Zod) precisarão ser criadas do zero a partir apenas dos rótulos de campo (CPF/CNPJ, CEP, telefone, moeda) — não há máscara/regex de referência no protótipo.
7. **Lista fixa de 9 tipos de documento "hardcoded"** no HTML — precisa virar uma tabela `DocumentType` configurável (spec 03); os nomes exatos capturados nesta auditoria (seção 7 de `REQUIREMENTS.md`) devem servir de seed inicial.
8. **Peso do arquivo por imagem duplicada** não é risco de arquitetura em si, mas sinaliza que ativos de marca precisam virar arquivos estáticos versionados (não inline em base64).
9. **Zero testes automatizados e zero CI hoje** — baseline de qualidade parte do zero (spec 09).
10. **Migração de Tailwind Play CDN → Tailwind via build (Vite/PostCSS)** é necessária; comportamento visual pode mudar sutilmente sem o purge/JIT do CDN.

## 16. OPEN QUESTIONS (auditoria)

Rodada de validação com o responsável do projeto em 2026-09-03 (ver detalhamento e citações em `docs/REQUIREMENTS.md`, seção "Consolidado de OPEN QUESTIONS desta fase"):

- **OQ-A1** — `EM ABERTO` (adiada deliberadamente, "validar posteriormente"): O botão "REPROVAR" deveria devolver automaticamente a etapa para o papel anterior, ou apenas sinalizar reprovação sem definir destino? O protótipo não implementa nenhum dos dois de forma completa (não reverte `etapa`). Enquanto não validada, assume-se devolução ao papel imediatamente anterior.
- **OQ-A2** — `RESOLVIDA` (2026-09-03): Sim, existe uma regra de negócio real de "mínimo 1 propriedade por solicitação" — confirmado pelo responsável do projeto.
- **OQ-A3** — `EM ABERTO` (adiada deliberadamente, "validar posteriormente"): os 3 pareceres (Consultor/Gerente/Crédito) devem ficar bloqueados para edição fora da etapa/papel correspondente?
- **OQ-A4** — `RESOLVIDA` (2026-09-03): a lista fixa de 9 tipos de documento é obrigatória para toda solicitação, independentemente do tipo de cliente — não há variação por PF/PJ, consistente com a decisão de não haver campo explícito de tipo de cliente (OQ-A7).
- **OQ-A5** — `PARCIALMENTE RESOLVIDA` (2026-09-03): tipos de arquivo aceitos definidos como PDF, JPEG e PNG. Tamanho máximo por upload/total continua em aberto.
- **OQ-A6** — `RESOLVIDA` (2026-09-03): sim, é intencional — um sócio pode ser pessoa jurídica, seguindo a mesma lógica de distinção por formato de documento do cliente (ver OQ-A7).
- **OQ-A7** — `RESOLVIDA` (2026-09-03): não é necessário um campo explícito de "tipo de cliente" (PF/PJ) — a distinção é feita por validação do formato do CPF/CNPJ (11 ou 14 dígitos), sem campo dedicado no schema.
