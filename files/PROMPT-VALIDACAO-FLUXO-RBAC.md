# Prompt de Validação — Etapas de Especificação e Ajuste de Fluxo RBAC

**Data:** 2026-09-15  
**Projeto:** Solicitação de Crédito — Tchê Agrícola  
**Objetivo:** Validar conclusão das especificações e ajustar fluxo de visualização conforme RBAC

---

## PARTE I — CHECKLIST DE ETAPAS COMPLETADAS

Antes de proceder com implementação, validar se as etapas abaixo foram **completadas, documentadas e alinhadas**:

### ✅ Fase 0 — Auditoria (Especificação 01)

**Entregáveis esperados:**

- [ ] `docs/PROJECT_AUDIT.md` gerado
  - [ ] Stack atual identificado
  - [ ] Estrutura de diretórios mapeada
  - [ ] Dependências listadas
  - [ ] Problemas de segurança identificados
  - [ ] Problemas de UX documentados
  - [ ] Riscos técnicos catalogados

- [ ] `docs/REQUIREMENTS.md` gerado
  - [ ] RF01 a RF11 validadas
  - [ ] Requisitos não funcionais confirmados
  - [ ] OPEN QUESTIONS listadas

- [ ] `docs/FUNCTIONAL-MAP.md` gerado
  - [ ] Mapeamento Protótipo → Componente → Entidade → API

**Validação:**

```
Protótipo HTML tem as seções:
1. Dados do cliente ✓
2. Solicitação e análise inicial (parece estar como "2 — SOLICITAÇÃO E ANÁLISE INICIAL")
3. Proprietários/sócios (FALTANDO CONFIRMAÇÃO)
4. Propriedades (FALTANDO CONFIRMAÇÃO)
5. Produção (FALTANDO CONFIRMAÇÃO)
6. Documentos e anexos ✓
7. Pareceres do workflow ✓
8. Assinatura ✓
```

**Questão aberta:** Seções 3, 4 e 5 existem no HTML? Onde estão exatamente?

---

### ✅ Fase 1 — UX e Fluxos (Especificação 02)

**Entregáveis esperados:**

- [ ] Wizard definido (8 etapas)
- [ ] Regras UX documentadas
- [ ] Responsividade (7 breakpoints)
- [ ] Dashboard por perfil definido
- [ ] Timeline implementável
- [ ] Devolução com motivo obrigatório
- [ ] Estados de interface (loading, skeleton, empty, erro, sucesso)
- [ ] Acessibilidade WCAG planejada

**Status atual do HTML:**

✓ Campo de status visível  
✓ Estrutura wizard (seções numeradas)  
✗ Responsividade mobile não validada  
✗ Drawer/sidebar mobile não implementado  
✗ Indicador de progresso compacto mobile não existe  
✗ Timeline não visualizável  
✗ Devolução com motivo não está no HTML  

**Ação requerida:** Ajustar CSS Tailwind para mobile-first e adicionar componentes de devolução.

---

### ✅ Fase 2 — Domínio e Workflow (Especificação 03 — NÃO ENVIADA)

**Esperado:** Arquivo `03-DOMINIO-E-WORKFLOW.md`

**Status:** ⚠️ **ARQUIVO NÃO ENCONTRADO**

**Questões críticas não resolvidas:**

1. Quais são os estados válidos? (RASCUNHO, ENVIADO, EM_ANALISE, DEVOLVIDO, APROVADO, REJEITADO...)
2. Quais são as transições válidas entre estados?
3. Quem pode fazer cada transição?
4. O que desencadeia automação?
5. Existe timeline de SLA?

**Ação:** Providenciar arquivo `03-DOMINIO-E-WORKFLOW.md` antes de implementar fluxo de backend.

---

### ✅ Fase 3 — API Backend (Especificação 04 — NÃO ENVIADA)

**Esperado:** Arquivo `04-API-BACKEND.md`

**Status:** ⚠️ **ARQUIVO NÃO ENCONTRADO**

**Questões críticas:**

1. Quais endpoints serão necessários?
2. Como será autenticação e autorização?
3. Qual banco de dados?
4. Como será persistência de solicitações parciais (rascunho)?

**Ação:** Providenciar arquivo `04-API-BACKEND.md`.

---

### ✅ Fase 4 — Banco de Dados (Especificação 05 — NÃO ENVIADA)

**Esperado:** Arquivo `05-BANCO-E-DADOS.md`

**Status:** ⚠️ **ARQUIVO NÃO ENCONTRADO**

---

### ✅ Fase 5 — Segurança (Especificação 06 — NÃO ENVIADA)

**Esperado:** Arquivo `06-SEGURANCA-E-LGPD.md`

**Status:** ⚠️ **ARQUIVO NÃO ENCONTRADO**

**Crítico para RBAC:**

1. Como validar se usuário é consultor da filial X?
2. Como garantir que consultor não veja solicitações de outras filiais?
3. Como garantir que gerente de crédito vê todas as filiais?
4. Como garantir segurança dos dados?

---

### ✅ Fase 6 — Documentos e Clicksign (Especificação 07)

**Entregáveis esperados:**

- [ ] Arquitetura DocumentGenerationService definida
- [ ] Arquitetura SignatureService definida
- [ ] Estados de assinatura definidos
- [ ] Webhook `/api/webhooks/clicksign` especificado
- [ ] Segurança de secrets definida

**Status no HTML:**

✓ Seção 7 — ASSINATURA existe  
✗ Não há integração real com Clicksign  
✗ Não há gerador de documento  
✗ Não há webhook de callback  

**Ação:** Especificar ClicksignAdapter com detalhes.

---

### ✅ Fase 7 — Frontend (Especificação 08)

**Stack definido:**
- React + TypeScript + Vite ✓
- React Router ✓
- TanStack Query ✓
- React Hook Form + Zod ✓
- Tailwind CSS + shadcn/ui ✓
- Lucide React ✓
- TanStack Table ✓

**Status:** HTML atual é vanilla. Será reescrito em React.

---

### ✅ Fase 8 — Testes e Aceite (Especificação 09)

**Entregáveis esperados:**

- [ ] Estratégia de testes unitários
- [ ] Estratégia de testes integração
- [ ] Cenário E2E 17 passos
- [ ] Critérios UX
- [ ] Critérios Workflow
- [ ] Critérios Segurança
- [ ] Critérios Qualidade

**Status:** Não iniciado (depende de backend).

---

### ✅ Fase 9 — Implementação (Especificação 10)

**Fases definidas:** 0-8 mapeadas.

---

### ✅ Fase 10 — Arquitetura de Decisões (Especificação 11)

**Arquivo enviado:** ✓ `11-DECISOES-ARQUITETURA.md`

---

### ✅ Fase 11 — Prompt de Execução (Especificação 12)

**Arquivo enviado:** ✓ `12-PROMPT-EXECUCAO-CLAUDE-CODE.md`

---

## RESUMO DE LACUNAS

| Arquivo | Status | Ação |
|---------|--------|------|
| 01-AUDITORIA-E-REQUISITOS.md | ✓ Enviado | Gerar PROJECT_AUDIT.md, REQUIREMENTS.md, FUNCTIONAL-MAP.md |
| 02-UX-E-FLUXOS.md | ✓ Enviado | Validar mobile, ajustar CSS, adicionar devolução |
| 03-DOMINIO-E-WORKFLOW.md | ✗ Falta | **CRÍTICO — Providenciar** |
| 04-API-BACKEND.md | ✗ Falta | **CRÍTICO — Providenciar** |
| 05-BANCO-E-DADOS.md | ✗ Falta | **CRÍTICO — Providenciar** |
| 06-SEGURANCA-E-LGPD.md | ✗ Falta | **CRÍTICO — Providenciar** |
| 07-DOCUMENTOS-E-CLICKSIGN.md | ✓ Enviado | Detalhar ClicksignAdapter |
| 08-FRONTEND-E-COMPONENTES.md | ✓ Enviado | Implementar em React |
| 09-TESTES-E-ACEITE.md | ✓ Enviado | Após backend pronto |
| 10-IMPLEMENTACAO-FASES.md | ✓ Enviado | Guia de execução |
| 11-DECISOES-ARQUITETURA.md | ✓ Enviado | Consultar antes de desvios |
| 12-PROMPT-EXECUCAO-CLAUDE-CODE.md | ✓ Enviado | Referência geral |

---

## PARTE II — AJUSTES DE FLUXO E VISIBILIDADE (RBAC)

### Requisito 1: Visibilidade Reduzida no Dashboard de Solicitações

**Perfil: Consultor**

```
Dashboard — Minhas Solicitações
┌─────────────────────────────────────────────┐
│ Cliente      │ Data      │ Status      │ Ação│
├─────────────────────────────────────────────┤
│ Fazenda ABC  │ 15/09/26  │ Rascunho    │ ⟳   │
│ Sítio XYZ    │ 12/09/26  │ Pendência   │ ⟳   │  ← Expandir
│ Cítrus Ltda  │ 10/09/26  │ Enviado     │ ✓   │  ← Apenas leitura
└─────────────────────────────────────────────┘

Regra: Mostrar apenas NOME_CLIENTE + DATA + STATUS

Exceção: Se status == "PENDÊNCIA", habilitar botão ⟳ (revisar pendência)
         Ao clicar, exibir tela completa com motivo da pendência
```

**Implementação:**

```jsx
// ListaSolicitacoes.tsx

interface SolicitacaoResumida {
  id: string;
  nomeCliente: string;
  dataCriacao: Date;
  status: StatusSolicitacao;
  temPendencia: boolean;
  motivoPendencia?: string;
}

export function ListaSolicitacoes() {
  const { data: solicitacoes } = useSolicitacoes();
  
  return (
    <table>
      <tbody>
        {solicitacoes.map(sol => (
          <tr key={sol.id}>
            <td>{sol.nomeCliente}</td>
            <td>{formatDate(sol.dataCriacao)}</td>
            <td>
              <StatusBadge status={sol.status} />
            </td>
            <td>
              {sol.temPendencia ? (
                <button onClick={() => abrirPendencia(sol.id)}>
                  Ver Pendência
                </button>
              ) : (
                <button disabled>—</button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

**API esperada:**

```
GET /api/solicitacoes?perfil=consultor
Response:
{
  id: string;
  nomeCliente: string;
  dataCriacao: ISO8601;
  status: "RASCUNHO" | "ENVIADO" | "PENDENCIA" | ...;
  temPendencia: boolean;
  motivoPendencia?: string;
}
```

---

### Requisito 2: Perfil Gerente da Filial

**Visibilidade:**

- Mesmos dados que o Consultor (resumido)
- Ao abrir: visão **completa** (cliente, propriedades, produção, documentos)
- Ações:
  - ✓ Devolver para Consultor (com motivo obrigatório)
  - ✓ Enviar para Gerente de Crédito
  - ✓ Ver pareceres do Consultor
  - ✓ Deixar parecer próprio

**Fluxo visual:**

```
Gerente da Filial A vê:
├─ Solicitações do Consultor A (filial A)
├─ Solicitações do Consultor B (filial A)
└─ Não vê solicitações de outra filial

Para cada solicitação:
├─ Resumo: Nome Cliente + Data + Status
├─ Se Pendência → Ver Pendência
├─ Se Enviado → Abrir completo
   ├─ Dados do cliente
   ├─ Propriedades
   ├─ Produção
   ├─ Documentos
   ├─ Parecer do Consultor ← LER
   ├─ Campo: Meu Parecer ← ESCREVER
   ├─ Botão: Devolver (obriga motivo)
   ├─ Botão: Enviar para Crédito
   └─ Timeline de eventos
```

**RBAC:**

```javascript
// Middleware de autorização
export function canViewSolicitacao(user: User, sol: Solicitacao): boolean {
  if (user.role === "GERENTE_CREDITO") return true;
  if (user.role === "GERENTE" && user.filialId === sol.filialId) return true;
  if (user.role === "CONSULTOR" && user.id === sol.consultorId) return true;
  return false;
}

export function canDevolver(user: User, sol: Solicitacao): boolean {
  if (user.role !== "GERENTE") return false;
  if (user.filialId !== sol.filialId) return false;
  if (sol.status !== "ENVIADO_GERENTE") return false;
  return true;
}

export function canEnviarAoCredito(user: User, sol: Solicitacao): boolean {
  if (user.role !== "GERENTE") return false;
  if (user.filialId !== sol.filialId) return false;
  if (sol.status !== "ENVIADO_GERENTE") return false;
  return true;
}
```

---

### Requisito 3: Perfil Gerente de Crédito (Central)

**Visibilidade:**

- Todas as filiais
- Visão completa de todas as solicitações
- Acesso a todos os pareceres (Consultor + Gerente da filial)
- Parecer próprio
- Aprovar ou Devolver para Gerente da filial

**Fluxo visual:**

```
Gerente de Crédito vê:
├─ Todas as solicitações (TODAS as filiais)
├─ Filtros: Filial + Status + Valor + Data
└─ Para cada solicitação:
   ├─ Dados completos (cliente, propriedades, produção)
   ├─ Documentos
   ├─ Timeline:
   │  ├─ Parecer do Consultor (data + autor)
   │  ├─ Parecer do Gerente da Filial (data + autor)
   │  └─ Meu parecer ← ESCREVER
   ├─ Botão: Aprovar (gera documento para assinatura)
   ├─ Botão: Devolver ao Gerente (com motivo)
   └─ Timeline de eventos
```

---

### Requisito 4: Cadeia de Pareceres

**Modelo:**

```
Consultor (filial A)
  └─ Cria solicitação
  └─ Deixa parecer: "Cliente idôneo, propriedade viável"
  └─ Envia ao Gerente da Filial A

Gerente Filial A
  └─ Lê parecer do Consultor
  └─ Deixa parecer: "Aprovado por mim, segue ao crédito"
  └─ Envia ao Gerente de Crédito

Gerente de Crédito (Central)
  └─ Lê parecer do Gerente
  └─ Lê parecer do Consultor
  └─ Deixa parecer: "Aprovado centralmente"
  └─ Aprova e gera documento para assinatura
```

**Estrutura de dados:**

```typescript
interface Parecer {
  id: string;
  solicitacaoId: string;
  autor: User;
  perfil: "CONSULTOR" | "GERENTE" | "GERENTE_CREDITO";
  conteudo: string;
  dataAtualizacao: Date;
  assinado: boolean;
}

interface Solicitacao {
  // ... outros campos
  pareceres: Parecer[];
  timeline: Event[];
}
```

**API esperada:**

```
GET /api/solicitacoes/:id/pareceres
Response: Parecer[]

POST /api/solicitacoes/:id/pareceres
Body: { conteudo: string }
Response: Parecer

POST /api/solicitacoes/:id/devolver
Body: { motivo: string, paraemail: "GERENTE" | "CONSULTOR" }
Response: { status: "success" }
```

---

### Requisito 5: Fluxo de Devolução com Motivo Obrigatório

**Modal de devolução:**

```jsx
export function ModalDevolucao({ 
  solicitacaoId, 
  onConfirm, 
  onCancel 
}) {
  const [motivo, setMotivo] = useState("");
  const [destinatario, setDestinatario] = useState("CONSULTOR");
  
  const handleConfirm = () => {
    if (!motivo.trim()) {
      toast.error("Motivo obrigatório");
      return;
    }
    onConfirm({ motivo, destinatario });
  };

  return (
    <Dialog open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Devolver Solicitação</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Motivo da Devolução</Label>
            <Textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Descreva os motivos..."
              rows={5}
              className="resize-none"
            />
            {!motivo && (
              <p className="text-red-500 text-sm mt-1">
                Motivo obrigatório
              </p>
            )}
          </div>

          <div>
            <Label>Devolver para</Label>
            <RadioGroup value={destinatario} onValueChange={setDestinatario}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="CONSULTOR" id="consultor" />
                <Label htmlFor="consultor">Consultor</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="GERENTE" id="gerente" />
                <Label htmlFor="gerente">Gerente (se sou Crédito)</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!motivo.trim()}
          >
            Confirmar Devolução
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

### Requisito 6: Informações de Documentos e Anexos

**Seção que falta no fluxo (presente no HTML, falta no backend):**

```
Documentos e Anexos
├─ CPF/CNPJ do cliente
├─ Contrato social (se PJ)
├─ Documentação da propriedade
├─ Comprovante de renda
├─ Últimos 3 comprovantes de venda

Para cada documento:
├─ Nome
├─ Tipo
├─ Data de upload
├─ Tamanho
├─ Status: [Enviado, Validado, Rejeitado]
├─ Botão: Download
├─ Botão: Visualizar (se PDF/imagem)
└─ Anotações do avaliador (gerente de crédito)
```

**Estrutura:**

```typescript
interface Documento {
  id: string;
  solicitacaoId: string;
  tipo: string; // "CPF", "CNPJ", "RG", "COMPROVANTE_RENDA"
  nome: string;
  storageKey: string; // referência em S3/Azure/GCS
  mimeType: string;
  size: number;
  status: "PENDENTE" | "VALIDADO" | "REJEITADO";
  uploadedBy: User;
  uploadedAt: Date;
  validadoBy?: User;
  validadoAt?: Date;
  anotacoes?: string;
}
```

---

### Requisito 7: Fluxo de Assinatura via Clicksign

**Após aprovação do Gerente de Crédito:**

```
1. Gerente de Crédito clica "Aprovar"
   ↓
2. Sistema gera documento (PDF com dados)
   ↓
3. Sistema envia documento ao Clicksign
   ↓
4. Clicksign cria fluxo de assinatura
   ↓
5. Sistema salva referência de signature_id no banco
   ↓
6. Email é enviado ao cliente para assinar
   ↓
7. Cliente assina via link Clicksign
   ↓
8. Webhook recebe evento SIGNED
   ↓
9. Sistema atualiza status para ASSINADO
   ↓
10. Solicitação finalizadas
```

**Componente na UI:**

```jsx
export function StatusAssinatura({ solicitacaoId }) {
  const { data: signature } = useQuery(
    ['signature', solicitacaoId],
    () => fetch(`/api/signatures/${solicitacaoId}`).then(r => r.json())
  );

  if (!signature) return <p>Não há assinatura</p>;

  return (
    <div className="border rounded p-4 space-y-3">
      <h3 className="font-semibold">Status de Assinatura</h3>
      
      <div className="flex items-center gap-2">
        <StatusBadge status={signature.status} />
        <span className="text-sm text-gray-600">
          {signature.status === 'PENDING' && 'Aguardando assinatura do cliente'}
          {signature.status === 'SIGNED' && `Assinado em ${formatDate(signature.signedAt)}`}
          {signature.status === 'DECLINED' && 'Cliente recusou assinatura'}
          {signature.status === 'EXPIRED' && 'Link expirou'}
        </span>
      </div>

      {signature.status === 'PENDING' && (
        <button 
          className="text-blue-600 text-sm underline"
          onClick={() => resendSignatureEmail(solicitacaoId)}
        >
          Reenviar link de assinatura
        </button>
      )}

      {signature.status === 'SIGNED' && signature.signedDocumentUrl && (
        <a 
          href={signature.signedDocumentUrl}
          className="text-blue-600 text-sm underline"
          target="_blank"
        >
          ↓ Baixar documento assinado
        </a>
      )}

      {signature.signers && (
        <div className="mt-3 border-t pt-3">
          <p className="text-xs font-semibold mb-2">Signatários:</p>
          {signature.signers.map(signer => (
            <div key={signer.id} className="text-xs space-y-1">
              <p>{signer.name} ({signer.email})</p>
              <p className="text-gray-500">
                {signer.signed ? `✓ Assinado em ${formatDate(signer.signedAt)}` : '○ Pendente'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## PARTE III — PRÓXIMAS AÇÕES OBRIGATÓRIAS

### Ação 1: Completar Especificações Faltantes

**Providenciar arquivos:**

```
✓ 01-AUDITORIA-E-REQUISITOS.md
✓ 02-UX-E-FLUXOS.md
✗ 03-DOMINIO-E-WORKFLOW.md         ← CRÍTICO
✗ 04-API-BACKEND.md               ← CRÍTICO
✗ 05-BANCO-E-DADOS.md             ← CRÍTICO
✗ 06-SEGURANCA-E-LGPD.md          ← CRÍTICO
✓ 07-DOCUMENTOS-E-CLICKSIGN.md
✓ 08-FRONTEND-E-COMPONENTES.md
✓ 09-TESTES-E-ACEITE.md
✓ 10-IMPLEMENTACAO-FASES.md
✓ 11-DECISOES-ARQUITETURA.md
✓ 12-PROMPT-EXECUCAO-CLAUDE-CODE.md
```

### Ação 2: Gerar Documentação de Auditoria

```bash
# Estrutura esperada:
docs/
├── PROJECT_AUDIT.md           ← O que existe hoje
├── REQUIREMENTS.md            ← RF01-RF11 validadas
├── FUNCTIONAL-MAP.md          ← Mapeamento protótipo → entidades
├── RBAC-MATRIZ.md             ← Matriz de permissões (novo)
├── FLUXO-ESTADOS.md           ← Estados e transições (novo)
└── API-ENDPOINTS.md           ← Endpoints esperados (novo)
```

### Ação 3: Ajustar HTML para Novos Requisitos

```html
<!-- Adicionar seções ao HTML existente: -->
<section>
  <h2>3 — PROPRIETÁRIOS E SÓCIOS</h2>
  <!-- Formulário + tabela -->
</section>

<section>
  <h2>4 — PROPRIEDADES</h2>
  <!-- Formulário + tabela -->
</section>

<section>
  <h2>5 — PRODUÇÃO POR SAFRA</h2>
  <!-- Formulário + tabela -->
</section>

<!-- Seções já existem: 6, 7, 8 -->

<!-- Adicionar: Modal de devolução com motivo obrigatório -->
<!-- Adicionar: Timeline visual de eventos -->
<!-- Adicionar: Pareceres em cadeia -->
```

### Ação 4: Validar HTML Responsivo

```bash
# Validar com chrome devtools:
✗ 320px (iPhone SE)
✗ 375px (iPhone)
✗ 390px (Pixel)
✗ 414px (iPhone+)
✓ 768px (iPad)
✗ 1024px (iPad Pro)
✓ 1280px+ (desktop)

# Ajustar CSS Tailwind:
- Drawer mobile para sidebar
- Grid responsivo
- Touch targets ≥ 44px
- Stack vertical no mobile
```

---

## PARTE IV — COMANDO DE EXECUÇÃO

**Para iniciar a implementação:**

```bash
# 1. Copiar especificações para diretório de trabalho
cp *.md docs/

# 2. Gerar auditoria
node scripts/audit.js > docs/PROJECT_AUDIT.md

# 3. Validar requisitos
node scripts/validate-requirements.js

# 4. Mapear funcionalidades
node scripts/generate-functional-map.js

# 5. Gerar matriz RBAC
node scripts/generate-rbac-matrix.js

# 6. Iniciar estrutura React
npm create vite@latest . -- --template react-ts

# 7. Implementar por fase:
# Fase 1: Auth + RBAC
# Fase 2: Listagem com resumo
# Fase 3: Visualização completa
# Fase 4: Devolução com motivo
# Fase 5: Pareceres em cadeia
# Fase 6: Documentos
# Fase 7: Clicksign
# Fase 8: Testes
```

---

## CHECKLIST FINAL ANTES DE INICIAR IMPLEMENTAÇÃO

- [ ] Arquivos 03, 04, 05, 06 disponíveis
- [ ] PROJECT_AUDIT.md gerado
- [ ] REQUIREMENTS.md atualizado
- [ ] FUNCTIONAL-MAP.md gerado
- [ ] RBAC-MATRIZ.md gerado
- [ ] FLUXO-ESTADOS.md gerado
- [ ] HTML validado (todas as seções presentes)
- [ ] Responsividade validada (7 breakpoints)
- [ ] Pareceres implementáveis (estrutura OK)
- [ ] Devolução com motivo (modal pronto)
- [ ] Clicksign adapter especificado
- [ ] Webhook `/api/webhooks/clicksign` definido
- [ ] Permissões RBAC documentadas
- [ ] Casos de teste E2E documentados

---

**Próximo passo:** Providenciar arquivos 03-06 ou validar se estão em outro local.
