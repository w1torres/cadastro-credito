# Quick Start — Implementação Imediata

**Projeto:** Solicitação de Crédito — Tchê Agrícola  
**Fase:** Validação e Preparação  
**Data:** 2026-09-15

---

## 🎯 OBJETIVO

Transformar o protótipo HTML e especificações em um sistema funcional com:
- ✓ Fluxo de solicitação guiado (wizard)
- ✓ RBAC completo (Consultor → Gerente → Crédito)
- ✓ Devoluções com motivo obrigatório
- ✓ Pareceres em cascata
- ✓ Documentos e anexos
- ✓ Assinatura via Clicksign

---

## 📋 PASSO 1: VALIDAR LACUNAS (30 minutos)

**O que fazer:**

```bash
# 1. Verificar se arquivos estão presentes:
ls -la 03-DOMINIO-E-WORKFLOW.md
ls -la 04-API-BACKEND.md
ls -la 05-BANCO-E-DADOS.md
ls -la 06-SEGURANCA-E-LGPD.md

# Se faltar algum, PARAR e solicitar ao time
# Estes são CRÍTICOS para prosseguir
```

**Checklist:**

- [ ] Arquivo 03 existe?
- [ ] Arquivo 04 existe?
- [ ] Arquivo 05 existe?
- [ ] Arquivo 06 existe?
- [ ] Todos têm conteúdo significativo (>1KB)?

**Se algum faltar:**
```
❌ HALT
Solicitar ao time os arquivos faltantes antes de continuar.
Não avançar sem especificações 03, 04, 05, 06.
```

**Se todos existem:**
```
✅ PROCEED para Passo 2
```

---

## 📝 PASSO 2: GERAR DOCUMENTAÇÃO DE AUDITORIA (1 hora)

**O que fazer:**

Criar 3 arquivos na pasta `docs/`:

### 2.1 `PROJECT_AUDIT.md`

```markdown
# Auditoria do Projeto Atual

## Stack Identificado
- Frontend: HTML vanilla + Tailwind CSS + Font Awesome
- Backend: NÃO EXISTE (será implementado)
- Banco: NÃO EXISTE (será implementado)
- Auth: NÃO EXISTE (será implementado)
- Armazenamento: NÃO EXISTE (será implementado)

## Estrutura Atual
```
projeto_solicitacao_credito_atualizado_v3.html
├── 770 linhas
├── Seções:
│   ├── 1 — Dados do Cliente
│   ├── 2 — Solicitação e Análise Inicial
│   ├── (faltam 3, 4, 5 — Proprietários, Propriedades, Produção)
│   ├── 6 — Documentos e Anexos
│   ├── 7 — Pareceres do Workflow
│   └── 8 — Assinatura (Clicksign)
├── Funcionalidades:
│   ├── Formulários com campos
│   ├── Validações cliente (algumas)
│   ├── Modal de assinatura (canvas)
│   └── Status badge
├── Problemas identificados:
│   ├── Responsividade não testada
│   ├── Sem backend de persistência
│   ├── Sem autenticação
│   ├── Sem RBAC
│   ├── Sem integração Clicksign real
│   └── Dados mockados/hardcoded

## Risco Técnico
🔴 ALTO — Sistema atual não é produção-ready
```

### 2.2 `REQUIREMENTS.md`

Usar como base `01-AUDITORIA-E-REQUISITOS.md` e validar cada RF:

```markdown
# Requisitos Validados

## Funcionais

| RF | Descrição | Protótipo | Status |
|---|---|---|---|
| RF01 | Cadastrar cliente | Sim, seção 1 | ✓ |
| RF02 | Múltiplos proprietários | Não identificado | ✗ |
| RF03 | Múltiplas propriedades | Não identificado | ✗ |
| RF04 | Dados produtivos | Não identificado | ✗ |
| RF05 | Documentos/anexos | Sim, seção 6 | ✓ |
| RF06 | Solicitação crédito | Sim, seção 2 | ✓ |
| RF07 | Workflow | Seções 7 | ⊙ Parcial |
| RF08 | Devolução com motivo | Não implementado | ✗ |
| RF09 | Histórico | Não implementado | ✗ |
| RF10 | Assinatura Clicksign | Seção 8 (mockado) | ⊙ Parcial |
| RF11 | Auditoria | Não implementado | ✗ |

## Não Funcionais

- Responsivo: ✗ (não validado)
- Acessível: ✗ (não validado)
- Seguro: ✗ (não existe backend)
- Testável: ✗ (código monolítico)
- Observável: ✗ (não existe)
- Modular: ✗ (monolítico)
- Persistente: ✗ (local storage apenas)
- Produção: ✗ (protótipo)
```

### 2.3 `FUNCTIONAL-MAP.md`

```markdown
# Mapeamento Funcional — Protótipo → Componentes → Entidades

## Seção 1 — Dados do Cliente

| Campo | Entidade | Atributo | Tipo | Obrigatório |
|-------|----------|----------|------|-------------|
| Nome/Razão Social | Cliente | nome | String | Sim |
| CPF/CNPJ | Cliente | cpfCnpj | String | Sim |
| Cônjuge | Cliente | nomeConjuge | String | Não |
| Telefone | Cliente | telefone | String | Não |
| Email | Cliente | email | Email | Sim |

## Seção 2 — Solicitação

| Campo | Entidade | Atributo | Tipo | Obrigatório |
|-------|----------|----------|------|-------------|
| Valor | SolicitacaoCredito | valor | Decimal | Sim |
| Finalidade | SolicitacaoCredito | finalidade | Enum | Sim |
| Prazo | SolicitacaoCredito | prazoMeses | Int | Sim |

## Seção 3 — Proprietários (FALTA NO PROTÓTIPO)

| Campo | Entidade | Atributo | Tipo | Obrigatório |
|-------|----------|----------|------|-------------|
| Nome | Proprietario | nome | String | Sim |
| CPF | Proprietario | cpf | String | Sim |
| Participação | Proprietario | percentualParticipacao | Decimal | Sim |

## ... (seções 4, 5 similar)

## Seção 6 — Documentos

| Campo | Entidade | Atributo | Tipo | Obrigatório |
|-------|----------|----------|------|-------------|
| Tipo | Documento | tipo | Enum | Sim |
| Arquivo | Documento | storageKey | String | Sim |
| Status | Documento | status | Enum | Sim |

## Seção 7 — Pareceres

| Campo | Entidade | Atributo | Tipo | Obrigatório |
|-------|----------|----------|------|-------------|
| Conteúdo | Parecer | conteudo | Text | Sim |
| Autor | Parecer | autorId | String | Sim |
| Perfil | Parecer | perfil | Enum | Sim |

## Seção 8 — Assinatura

| Campo | Entidade | Atributo | Tipo | Obrigatório |
|-------|----------|----------|------|-------------|
| Signature ID | Assinatura | clicksignId | String | Sim |
| Status | Assinatura | status | Enum | Sim |
```

---

## 🏗️ PASSO 3: ESTRUTURAR REPOSITÓRIO (1.5 horas)

**O que fazer:**

```bash
# 3.1 Criar estrutura de diretórios

mkdir -p docs
mkdir -p backend
mkdir -p frontend
mkdir -p tests

# 3.2 Criar backend

cd backend
npm init -y
npm install express typescript tsx zod prisma @prisma/client jsonwebtoken bcryptjs cors dotenv

# 3.3 Criar frontend

cd ../frontend
npm create vite@latest . -- --template react-ts

npm install react-router-dom @tanstack/react-query react-hook-form zod \
  @hookform/resolvers tailwindcss postcss autoprefixer lucide-react \
  @radix-ui/react-dialog @radix-ui/react-radio-group @radix-ui/react-tabs \
  clsx class-variance-authority

# 3.4 Configurar TailwindCSS

npx tailwindcss init -p

# 3.5 Copiar especificações para docs

cp ../*.md docs/
```

**Estrutura esperada:**

```
projeto/
├── docs/
│   ├── 01-AUDITORIA-E-REQUISITOS.md
│   ├── 02-UX-E-FLUXOS.md
│   ├── 03-DOMINIO-E-WORKFLOW.md
│   ├── 04-API-BACKEND.md
│   ├── 05-BANCO-E-DADOS.md
│   ├── 06-SEGURANCA-E-LGPD.md
│   ├── 07-DOCUMENTOS-E-CLICKSIGN.md
│   ├── 08-FRONTEND-E-COMPONENTES.md
│   ├── 09-TESTES-E-ACEITE.md
│   ├── 10-IMPLEMENTACAO-FASES.md
│   ├── 11-DECISOES-ARQUITETURA.md
│   ├── 12-PROMPT-EXECUCAO-CLAUDE-CODE.md
│   ├── PROJECT_AUDIT.md (NOVO)
│   ├── REQUIREMENTS.md (NOVO)
│   ├── FUNCTIONAL-MAP.md (NOVO)
│   ├── RBAC-MATRIZ.md (NOVO)
│   └── FLUXO-ESTADOS.md (NOVO)
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── schemas/
│   │   ├── types/
│   │   ├── db/
│   │   └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── types/
│   │   ├── routes/
│   │   └── App.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
└── .gitignore
```

---

## 🗄️ PASSO 4: DESIGN DO BANCO DE DADOS (2 horas)

**O que fazer:**

Criar `backend/prisma/schema.prisma` com modelos:

```prisma
// Exemplo estrutura base

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  senha         String
  nome          String
  role          Role
  filialId      String?   // Nulo para GERENTE_CREDITO
  filial        Filial?   @relation(fields: [filialId], references: [id])
  ativo         Boolean   @default(true)
  criadoEm      DateTime  @default(now())
  atualizadoEm  DateTime  @updatedAt

  consultorias  Solicitacao[]
  pareceres     Parecer[]
  devolucoes    Devolucao[]
  auditoria     Auditoria[]
}

model Filial {
  id        String   @id @default(cuid())
  nome      String   @unique
  usuarios  User[]
  solicitacoes Solicitacao[]
}

model Solicitacao {
  id                String  @id @default(cuid())
  consultorId       String
  consultor         User    @relation(fields: [consultorId], references: [id])
  filialId          String
  filial            Filial  @relation(fields: [filialId], references: [id])
  
  // Cliente
  nomeCliente       String
  cpfCnpj           String
  
  // Solicitação
  valor             Decimal
  finalidade        String
  prazo             Int
  
  // Status
  status            StatusSolicitacao @default(RASCUNHO)
  
  // Relacionamentos
  proprietarios     Proprietario[]
  propriedades      Propriedade[]
  producoes         Producao[]
  documentos        Documento[]
  pareceres         Parecer[]
  devolucoes        Devolucao[]
  assinatura        Assinatura?
  timeline          Evento[]
  
  // Auditoria
  criadoEm          DateTime @default(now())
  atualizadoEm      DateTime @updatedAt
  deletadoEm        DateTime?
}

model Proprietario {
  id                    String   @id @default(cuid())
  solicitacaoId         String
  solicitacao           Solicitacao @relation(fields: [solicitacaoId], references: [id], onDelete: Cascade)
  nome                  String
  cpf                   String
  percentualParticipacao Decimal
  criadoEm              DateTime @default(now())
}

model Propriedade {
  id                String   @id @default(cuid())
  solicitacaoId     String
  solicitacao       Solicitacao @relation(fields: [solicitacaoId], references: [id], onDelete: Cascade)
  endereco          String
  area              Decimal
  producoes         Producao[]
  criadoEm          DateTime @default(now())
}

model Producao {
  id                String   @id @default(cuid())
  propriedadeId     String
  propriedade       Propriedade @relation(fields: [propriedadeId], references: [id], onDelete: Cascade)
  safra             String
  cultura           String
  producaoEstimada  Decimal
  criadoEm          DateTime @default(now())
}

model Documento {
  id                String   @id @default(cuid())
  solicitacaoId     String
  solicitacao       Solicitacao @relation(fields: [solicitacaoId], references: [id], onDelete: Cascade)
  tipo              String
  nome              String
  storageKey        String  // S3 key ou similar
  status            String  @default("PENDENTE")
  uploadadoPor      String
  uploadadoEm       DateTime @default(now())
  validadoEm        DateTime?
  anotacoes         String?
}

model Parecer {
  id                String   @id @default(cuid())
  solicitacaoId     String
  solicitacao       Solicitacao @relation(fields: [solicitacaoId], references: [id], onDelete: Cascade)
  autorId           String
  autor             User    @relation(fields: [autorId], references: [id])
  perfil            String  // CONSULTOR | GERENTE | GERENTE_CREDITO
  conteudo          String
  criadoEm          DateTime @default(now())
  atualizadoEm      DateTime @updatedAt
}

model Devolucao {
  id                String   @id @default(cuid())
  solicitacaoId     String
  solicitacao       Solicitacao @relation(fields: [solicitacaoId], references: [id], onDelete: Cascade)
  devolvidoPor      String
  devolvidoPorUser  User    @relation(fields: [devolvidoPor], references: [id])
  devolvidoPara     String  // CONSULTOR | GERENTE
  motivo            String
  statusAnterior    String
  criadoEm          DateTime @default(now())
}

model Assinatura {
  id                String   @id @default(cuid())
  solicitacaoId     String  @unique
  solicitacao       Solicitacao @relation(fields: [solicitacaoId], references: [id], onDelete: Cascade)
  clicksignId       String  @unique
  status            String  // PENDING | SIGNED | DECLINED | EXPIRED
  documentoUrl      String?
  assinadoEm        DateTime?
  criadoEm          DateTime @default(now())
  atualizadoEm      DateTime @updatedAt
}

model Evento {
  id                String   @id @default(cuid())
  solicitacaoId     String
  solicitacao       Solicitacao @relation(fields: [solicitacaoId], references: [id], onDelete: Cascade)
  tipo              String  // CRIADA | ENVIADA | DEVOLVIDA | APROVADA | etc
  descricao         String
  usuarioId         String
  criadoEm          DateTime @default(now())
}

model Auditoria {
  id                String   @id @default(cuid())
  usuarioId         String
  usuario           User    @relation(fields: [usuarioId], references: [id])
  acao              String
  descricao         String?
  recursoId         String?
  ip                String?
  criadoEm          DateTime @default(now())
}

enum Role {
  CONSULTOR
  GERENTE
  GERENTE_CREDITO
  ADMIN
}

enum StatusSolicitacao {
  RASCUNHO
  ENVIADO_GERENTE
  DEVOLVIDO_GERENTE
  ENVIADO_CREDITO
  DEVOLVIDO_CREDITO_GERENTE
  APROVADO
  GERANDO_DOCUMENTO
  AGUARDANDO_ASSINATURA
  ASSINADO
  RECUSADO_CLIENTE
  REJEITADO
  CANCELADO
}
```

---

## 🚀 PASSO 5: IMPLEMENTAR FASE 1 (Backend Auth) — 8 horas

**O que fazer:**

```bash
# 5.1 Setup Prisma
cd backend
npx prisma init

# 5.2 Configurar .env
cat > .env << 'EOF'
DATABASE_URL="postgresql://user:password@localhost:5432/tchê_credito"
JWT_SECRET="sua-chave-super-secreta"
NODE_ENV="development"
PORT=3000
EOF

# 5.3 Criar migrations
npx prisma migrate dev --name init

# 5.4 Implementar:
# - POST /auth/login
# - POST /auth/logout  
# - POST /auth/refresh
# - GET /auth/me
# - Middleware JWT
# - Middleware RBAC
```

**Checklist:**

- [ ] Banco criado e rodando
- [ ] Migrations aplicadas
- [ ] Endpoints de auth funcionando
- [ ] Tokens JWT gerados corretamente
- [ ] RBAC middleware testado (negação 403)
- [ ] Testes de login/logout rodando

---

## 🎨 PASSO 6: IMPLEMENTAR FASE 2 (Frontend estrutura) — 6 horas

**O que fazer:**

```bash
cd frontend

# 6.1 Criar estrutura de pastas

mkdir -p src/components/ui
mkdir -p src/features/{auth,solicitacoes,dashboard}
mkdir -p src/hooks src/lib src/types src/schemas

# 6.2 Implementar:
# - AuthContext + useAuth hook
# - Router setup
# - Login page
# - Dashboard layout
# - ListaSolicitacoes (resumo)

# 6.3 Testar login
npm run dev
# Acessar localhost:5173
```

**Checklist:**

- [ ] Router funcionando
- [ ] Login/logout funcionando
- [ ] Token salvo em localStorage
- [ ] Dashboard carrega dados
- [ ] Responsividade base OK

---

## 📊 PASSO 7: IMPLEMENTAR FASE 3 (Fluxo de devoluções) — 10 horas

**O que fazer:**

1. **Backend:**
   - POST /api/solicitacoes/:id/devolver
   - Validar RBAC
   - Criar devolução
   - Atualizar status
   - Registrar evento

2. **Frontend:**
   - ModalDevolucao (motivo obrigatório)
   - Botão devolver (visível se pode)
   - Timeline eventos
   - Refetch após devolução

**Checklist:**

- [ ] Endpoint devolver implementado
- [ ] RBAC validado (gerente só sua filial)
- [ ] Motivo é obrigatório
- [ ] Devolução registra evento
- [ ] Timeline mostra devoluções
- [ ] E2E: gerente devove, consultor vê

---

## 💬 PASSO 8: IMPLEMENTAR FASE 4 (Pareceres em cascata) — 8 horas

**O que fazer:**

1. **Backend:**
   - GET /api/solicitacoes/:id/pareceres
   - POST /api/solicitacoes/:id/pareceres
   - Validar visibilidade por perfil

2. **Frontend:**
   - PainelPareceres (ler pareceres anteriores)
   - Campo para deixar parecer próprio
   - Validação (mínimo 5 caracteres)

**Checklist:**

- [ ] Pareceres salvam no banco
- [ ] Visibilidade por perfil OK
- [ ] Componente mostra cascata
- [ ] Parecer próprio é editável

---

## 📁 PASSO 9: DOCUMENTOS (Fase 5) — 6 horas

**O que fazer:**

1. Backend: Upload/download
2. Frontend: ListaDocumentos
3. Storage: Configurar S3/Azure/GCS

---

## ✍️ PASSO 10: CLICKSIGN (Fase 6) — 12 horas

**O que fazer:**

1. Registrar conta Clicksign
2. Pegar API credentials
3. Implementar ClicksignAdapter
4. Webhook `/api/webhooks/clicksign`
5. Testes

---

## 🧪 PASSO 11: TESTES (Fase 7) — 8 horas

**O que fazer:**

1. Unit tests: RBAC functions
2. Integration tests: endpoints
3. E2E: fluxo completo

---

## 🛡️ PASSO 12: HARDENING (Fase 8) — 4 horas

- Segurança
- Performance
- Observabilidade

---

## 📅 TIMELINE RECOMENDADA

| Fase | Horas | Data Estimada |
|------|-------|---|
| Validação (Passos 1-3) | 2.5h | Today |
| Banco de Dados (Passo 4) | 2h | Today |
| Backend Auth (Passo 5) | 8h | Tomorrow |
| Frontend Estrutura (Passo 6) | 6h | Day 3 |
| Fluxo Devoluções (Passo 7) | 10h | Day 4-5 |
| Pareceres (Passo 8) | 8h | Day 6 |
| Documentos (Passo 9) | 6h | Day 7 |
| Clicksign (Passo 10) | 12h | Day 8-9 |
| Testes (Passo 11) | 8h | Day 10 |
| Hardening (Passo 12) | 4h | Day 11 |
| **TOTAL** | **~64h** | **~2 semanas** |

---

## 🚨 BLOQUEADORES IMEDIATOS

Se algum destes não for resolvido **HOJE**, projeto está bloqueado:

1. ✅ Especificações 03, 04, 05, 06 disponíveis?
2. ✅ Time alinhado em arquitetura (monorepo vs mono vs micros)?
3. ✅ BD escolhido (PostgreSQL assume-se)?
4. ✅ Cloud escolhida (para storage de docs)?
5. ✅ Clicksign account criada?
6. ✅ Email provider escolhido (SendGrid/AWS SES)?

---

## 🎬 PRÓXIMO PASSO

```bash
# 1. Validar especificações (30 min)
# 2. Gerar auditoria docs (1 hora)
# 3. Setup repositório (1.5 hora)
# 4. Iniciar Passo 4 (DB design)

# Executar AGORA:
echo "✓ Passo 1: Validação"
echo "✓ Passo 2: Auditoria"
echo "✓ Passo 3: Repositório"
echo "→ Passo 4: Banco de Dados (PRÓXIMO)"
```

---

**Tempo total de preparação:** ~6 horas  
**Data esperada de início da implementação:** Após validação das lacunas

**Responsável:** Equipe de desenvolvimento  
**Revisado:** 2026-09-15
