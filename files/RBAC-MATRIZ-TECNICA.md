# Matriz RBAC Técnica — Solicitação de Crédito

**Projeto:** Tchê Agrícola — Solicitação de Crédito  
**Versão:** 1.0  
**Data:** 2026-09-15

---

## MATRIZ DE VISIBILIDADE

### Legenda
- ✓ = Acesso completo
- ⊙ = Acesso condicionado
- ○ = Visualização/Leitura
- ✗ = Bloqueado
- 🚫 = Crítico (erro de segurança se liberado)

---

## I. VISIBILIDADE DE SOLICITAÇÕES

| Recurso | Consultor | Gerente Filial | Gerente Crédito |
|---------|-----------|---|---|
| **Solicitações próprias** | ✓ | ○ | ○ |
| **Solicitações da filial** | — | ✓ | ○ |
| **Todas as solicitações** | ✗ | ✗ | ✓ |
| **Filtro por filial** | ✗ | Apenas sua filial | ✓ (todas) |
| **Filtro por status** | ✓ | ✓ | ✓ |
| **Filtro por valor** | ✗ | ✗ | ✓ |
| **Filtro por consultor** | ✗ | ✓ (da filial) | ✓ |
| **Exportar relatório** | ✗ | ✗ | ✓ |

---

## II. EDIÇÃO E MODIFICAÇÃO

| Ação | Consultor | Gerente Filial | Gerente Crédito |
|------|-----------|---|---|
| **Criar solicitação** | ✓ | ✓ | ✗ |
| **Editar rascunho próprio** | ✓ | ✗ | ✗ |
| **Editar rascunho de outro** | ✗ | ✗ | ✗ |
| **Enviar ao gerente** | ✓ | ✗ | ✗ |
| **Receber solicitação** | ✗ | ⊙ (filial) | ✓ |
| **Devolver ao consultor** | ✗ | ⊙ (se gerente filial) | ✗ |
| **Devolver ao gerente** | ✗ | ✗ | ⊙ (se gerente crédito) |
| **Enviar ao crédito** | ✗ | ⊙ (se gerente filial) | ✗ |
| **Aprovar crédito** | ✗ | ✗ | ✓ |
| **Rejeitar** | ✗ | ✗ | ⊙ (se gerente crédito) |

---

## III. VISUALIZAÇÃO DE DADOS

### Seção: Dados do Cliente

| Campo | Consultor | Gerente Filial | Gerente Crédito |
|-------|-----------|---|---|
| Nome/Razão Social | ✓ | ○ | ○ |
| CPF/CNPJ | ✓ | ○ | ○ |
| Telefone | ✓ | ○ | ○ |
| Email | ✓ | ○ | ○ |
| Endereço | ✓ | ○ | ○ |

### Seção: Solicitação de Crédito

| Campo | Consultor | Gerente Filial | Gerente Crédito |
|-------|-----------|---|---|
| Valor solicitado | ✓ | ⊙* | ○ |
| Finalidade | ✓ | ⊙* | ○ |
| Prazo | ✓ | ⊙* | ○ |
| Taxa proposta | ✗ | ✗ | ○ |

> *⊙ Gerente vê apenas se solicitação foi enviada a ele

### Seção: Propriedades

| Recurso | Consultor | Gerente Filial | Gerente Crédito |
|---------|-----------|---|---|
| Adicionar propriedade | ✓ | ✗ | ✗ |
| Editar propriedade | ✓ | ✗ | ✗ |
| Deletar propriedade | ✓ | ✗ | ✗ |
| Visualizar propriedades | ✓ | ⊙ | ○ |
| Análise de propriedade | ✗ | ○ | ○ |

### Seção: Produção

| Recurso | Consultor | Gerente Filial | Gerente Crédito |
|---------|-----------|---|---|
| Adicionar produção | ✓ | ✗ | ✗ |
| Editar produção | ✓ | ✗ | ✗ |
| Visualizar produção | ✓ | ⊙ | ○ |

### Seção: Documentos e Anexos

| Recurso | Consultor | Gerente Filial | Gerente Crédito |
|---------|-----------|---|---|
| Upload de documento | ✓ | ✗ | ✗ |
| Deletar documento | ✓ | ✗ | ✗ |
| Visualizar documentos | ✓ | ⊙ | ○ |
| Validar documento | ✗ | ⊙ | ✓ |
| Deixar anotação | ✗ | ✗ | ⊙ |

### Seção: Pareceres

| Recurso | Consultor | Gerente Filial | Gerente Crédito |
|---------|-----------|---|---|
| Deixar parecer próprio | ✓ | ✓ | ✓ |
| Ver parecer do consultor | ✓ (próprio) | ✓ | ✓ |
| Ver parecer do gerente | ✗ | ✓ (próprio) | ✓ |
| Ver parecer do crédito | ✗ | ✓ | ✓ (próprio) |
| Editar parecer próprio | ⊙ (rascunho) | ⊙ (rascunho) | ⊙ (rascunho) |

### Seção: Workflow e Devoluções

| Recurso | Consultor | Gerente Filial | Gerente Crédito |
|---------|-----------|---|---|
| Ver timeline | ✓ | ✓ | ✓ |
| Ver motivos devoluções | ✓ | ✓ | ✓ |
| Devolver com motivo | ✗ | ⊙ | ⊙ |
| Corrigir após devolução | ✓ | ✗ | ✗ |

### Seção: Assinatura Clicksign

| Recurso | Consultor | Gerente Filial | Gerente Crédito |
|---------|-----------|---|---|
| Visualizar status | ✓ | ○ | ○ |
| Gerar documento | ✗ | ✗ | ✓ |
| Enviar ao Clicksign | ✗ | ✗ | ✓ |
| Resend link assinatura | ✗ | ✗ | ⊙ |
| Baixar assinado | ✓ | ✓ | ✓ |
| Cancelar assinatura | ✗ | ✗ | ⊙ |

---

## IV. TRANSIÇÕES DE ESTADO PERMITIDAS

### Estado: RASCUNHO

```
Consultor:
  RASCUNHO →(enviar)→ ENVIADO_GERENTE ✓
  RASCUNHO →(deletar)→ DELETADO ✓

Gerente:
  Não pode fazer transições em rascunho ✓

Crédito:
  Não pode fazer transições em rascunho ✓
```

### Estado: ENVIADO_GERENTE

```
Consultor:
  Sem ações (apenas leitura) ✓

Gerente (da filial):
  ENVIADO_GERENTE →(devolver)→ DEVOLVIDO_GERENTE (com motivo obrigatório) ✓
  ENVIADO_GERENTE →(enviar crédito)→ ENVIADO_CREDITO ✓
  ENVIADO_GERENTE →(deixar parecer)→ ENVIADO_GERENTE (sem mudar estado) ✓

Crédito:
  Não pode fazer transições neste estado ✓
```

### Estado: DEVOLVIDO_GERENTE

```
Consultor:
  DEVOLVIDO_GERENTE →(corrigir)→ ENVIADO_GERENTE (reenvia ao gerente) ✓
  Pode editar dados (com motivo de devolução visível) ✓

Gerente:
  Sem ações (apenas leitura) ✓

Crédito:
  Não pode fazer transições neste estado ✓
```

### Estado: ENVIADO_CREDITO

```
Consultor:
  Sem ações (apenas leitura) ✓

Gerente:
  Sem ações (apenas leitura) ✓

Crédito:
  ENVIADO_CREDITO →(devolver gerente)→ DEVOLVIDO_CREDITO_GERENTE (com motivo) ✓
  ENVIADO_CREDITO →(aprovar)→ APROVADO ✓
  ENVIADO_CREDITO →(rejeitar)→ REJEITADO ✓
  ENVIADO_CREDITO →(deixar parecer)→ ENVIADO_CREDITO (sem mudar estado) ✓
```

### Estado: DEVOLVIDO_CREDITO_GERENTE

```
Gerente:
  DEVOLVIDO_CREDITO_GERENTE →(corrigir)→ ENVIADO_CREDITO ✓
  Pode editar dados, deixar novo parecer ✓

Crédito:
  Sem ações (apenas leitura) ✓
```

### Estado: APROVADO

```
Crédito:
  APROVADO →(gerar doc)→ GERANDO_DOCUMENTO ✓
  APROVADO →(enviar clicksign)→ AGUARDANDO_ASSINATURA ✓

Todos:
  Apenas leitura, sem edições ✓
```

### Estado: AGUARDANDO_ASSINATURA

```
Sistema (webhook):
  AGUARDANDO_ASSINATURA →(cliente assinou)→ ASSINADO ✓
  AGUARDANDO_ASSINATURA →(cliente recusou)→ RECUSADO_CLIENTE ✓
  AGUARDANDO_ASSINATURA →(expirou)→ ASSINATURA_EXPIRADA ✓

Crédito:
  Pode resend link (sem mudar estado) ✓

Todos:
  Apenas leitura ✓
```

---

## V. CHECKLIST DE IMPLEMENTAÇÃO RBAC

### Backend — Autenticação

- [ ] JWT com `userId`, `role`, `filialId` no token
- [ ] Roles: CONSULTOR | GERENTE | GERENTE_CREDITO | ADMIN
- [ ] Refresh token com TTL de 7 dias
- [ ] Logout com invalidação
- [ ] Rate limiting em login (máx 5 tentativas/5 minutos)

### Backend — Autorização (Middleware)

```typescript
// middleware/rbac.ts

export function canViewSolicitacao(user: User, sol: Solicitacao) {
  if (user.role === "GERENTE_CREDITO") return true;
  if (user.role === "GERENTE" && user.filialId === sol.filialId) return true;
  if (user.role === "CONSULTOR" && user.id === sol.consultorId) return true;
  return false;
}

export function canEditSolicitacao(user: User, sol: Solicitacao) {
  if (user.role !== "CONSULTOR") return false;
  if (user.id !== sol.consultorId) return false;
  if (!["RASCUNHO", "DEVOLVIDO_GERENTE", "DEVOLVIDO_CREDITO_GERENTE"].includes(sol.status)) {
    return false;
  }
  return true;
}

export function canDevolverGerente(user: User, sol: Solicitacao) {
  if (user.role !== "GERENTE") return false;
  if (user.filialId !== sol.filialId) return false;
  if (sol.status !== "ENVIADO_GERENTE") return false;
  return true;
}

export function canDevolverCredito(user: User, sol: Solicitacao) {
  if (user.role !== "GERENTE_CREDITO") return false;
  if (sol.status !== "ENVIADO_CREDITO") return false;
  return true;
}

export function canAprovar(user: User, sol: Solicitacao) {
  if (user.role !== "GERENTE_CREDITO") return false;
  if (!["ENVIADO_CREDITO"].includes(sol.status)) return false;
  return true;
}
```

- [ ] Implementar todos os canX() acima
- [ ] Aplicar em cada endpoint
- [ ] Testar negação de acesso (403)

### Backend — API Endpoints

```
[AUTH]
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me

[SOLICITAÇÕES]
GET    /api/solicitacoes (lista com filtros e RBAC)
GET    /api/solicitacoes/:id (visibilidade limitada)
GET    /api/solicitacoes/:id/resumo (nome+data+status)
POST   /api/solicitacoes (criar)
PUT    /api/solicitacoes/:id (editar)
DELETE /api/solicitacoes/:id (deletar rascunho)

[TRANSIÇÕES]
POST /api/solicitacoes/:id/enviar-gerente
POST /api/solicitacoes/:id/devolver (body: {motivo, destinatario})
POST /api/solicitacoes/:id/enviar-credito
POST /api/solicitacoes/:id/aprovar
POST /api/solicitacoes/:id/rejeitar

[PARECERES]
GET    /api/solicitacoes/:id/pareceres
POST   /api/solicitacoes/:id/pareceres (criar/atualizar)
DELETE /api/solicitacoes/:id/pareceres/:pareceId

[DOCUMENTOS]
POST   /api/solicitacoes/:id/documentos (upload)
DELETE /api/solicitacoes/:id/documentos/:docId
GET    /api/solicitacoes/:id/documentos
GET    /api/documentos/:id/download

[TIMELINE]
GET /api/solicitacoes/:id/timeline

[ASSINATURA]
POST   /api/solicitacoes/:id/gerar-documento
POST   /api/solicitacoes/:id/enviar-clicksign
POST   /api/signatures/:id/resend
GET    /api/signatures/:id

[WEBHOOKS]
POST /api/webhooks/clicksign (callback)

[ADMIN]
GET  /api/admin/usuarios
POST /api/admin/usuarios
PUT  /api/admin/usuarios/:id
```

- [ ] Todos os endpoints implementados
- [ ] RBAC aplicado em cada um
- [ ] Validação de payload (Zod/Joi)
- [ ] Tratamento de erros (400, 403, 404, 500)
- [ ] Logs de auditoria

### Frontend — Componentes

- [ ] Componente: `ListaSolicitacoes.tsx`
  - [ ] Resumo (nome + data + status)
  - [ ] Expandir apenas se pendência
  - [ ] Responsivo mobile

- [ ] Componente: `ViewSolicitacao.tsx`
  - [ ] Visibilidade limitada por perfil
  - [ ] Timeline eventos
  - [ ] Pareceres em cascata
  - [ ] Seções colapsáveis

- [ ] Componente: `ModalDevolucao.tsx`
  - [ ] Textarea motivo (obrigatório)
  - [ ] Radio: destinatario (CONSULTOR/GERENTE)
  - [ ] Validação cliente

- [ ] Componente: `PainelPareceres.tsx`
  - [ ] Exibir parecer do consultor (ler)
  - [ ] Exibir parecer do gerente (ler se crédito)
  - [ ] Campo de texto para próprio parecer
  - [ ] Botão salvar parecer

- [ ] Componente: `DocumentoList.tsx`
  - [ ] Listar com nome, tipo, data, status
  - [ ] Botão download
  - [ ] Botão visualizar (se PDF/imagem)
  - [ ] Anotações (apenas crédito)

- [ ] Componente: `StatusAssinatura.tsx`
  - [ ] Status badge
  - [ ] Timeline de eventos (enviado, visualizado, assinado)
  - [ ] Botão resend (se pendente)
  - [ ] Botão download (se assinado)
  - [ ] Listar signatários com status

- [ ] Componente: `Dashboard.tsx` (por perfil)
  - [ ] Consultor: minhas solicitações
  - [ ] Gerente: solicitações da filial
  - [ ] Crédito: todas as solicitações

### Frontend — Fluxos (Happy Path)

- [ ] **Consultor cria e envia**
  ```
  1. Login → Dashboard
  2. Novo → Preench cliente
  3. Próximo → Preench solicitação
  4. ... (todas as etapas)
  5. Revisão → Confirmar
  6. Enviar → Status ENVIADO_GERENTE
  7. Dashboard → "Enviado com sucesso"
  ```

- [ ] **Gerente recebe e devove**
  ```
  1. Login → Dashboard
  2. Ver "Solicitações pendentes"
  3. Abrir solicitação
  4. Ler parecer do consultor
  5. Deixar parecer próprio
  6. Clicar "Devolver"
  7. Modal: escrever motivo
  8. Confirmar → Status DEVOLVIDO
  9. Email ao consultor
  10. Gerente vê "Devolvido com sucesso"
  ```

- [ ] **Gerente envia para crédito**
  ```
  1. Abrir solicitação
  2. Ler parecer do consultor
  3. Deixar parecer próprio
  4. Clicar "Enviar ao Crédito"
  5. Confirmação → Status ENVIADO_CREDITO
  6. Email ao gerente de crédito
  ```

- [ ] **Crédito aprova e gera assinatura**
  ```
  1. Login → Dashboard
  2. Ver "Solicitações a análise"
  3. Abrir solicitação
  4. Ler parecer do gerente
  5. Ler parecer do consultor
  6. Ver documentos
  7. Deixar parecer próprio
  8. Clicar "Aprovar"
  9. Gerar documento (PDF)
  10. Enviar ao Clicksign
  11. Status → AGUARDANDO_ASSINATURA
  12. Email ao cliente com link
  ```

- [ ] **Cliente assina (via Clicksign)**
  ```
  1. Recebe email com link
  2. Clica link → Clicksign
  3. Visualiza documento
  4. Assina digitalmente
  5. Webhook dispara (SIGNED)
  6. Sistema atualiza status → ASSINADO
  7. Email ao gerente de crédito
  ```

### Testes Unitários

```typescript
// tests/rbac.test.ts

describe("RBAC", () => {
  describe("canViewSolicitacao", () => {
    it("Consultor vê solicitação própria", () => {
      const user = { id: "user1", role: "CONSULTOR" };
      const sol = { consultorId: "user1" };
      expect(canViewSolicitacao(user, sol)).toBe(true);
    });

    it("Consultor não vê solicitação de outro", () => {
      const user = { id: "user1", role: "CONSULTOR" };
      const sol = { consultorId: "user2" };
      expect(canViewSolicitacao(user, sol)).toBe(false);
    });

    it("Gerente vê solicitações da filial", () => {
      const user = { id: "user1", role: "GERENTE", filialId: "f1" };
      const sol = { filialId: "f1" };
      expect(canViewSolicitacao(user, sol)).toBe(true);
    });

    it("Gerente não vê solicitações de outra filial", () => {
      const user = { id: "user1", role: "GERENTE", filialId: "f1" };
      const sol = { filialId: "f2" };
      expect(canViewSolicitacao(user, sol)).toBe(false);
    });

    it("Gerente de crédito vê tudo", () => {
      const user = { id: "user1", role: "GERENTE_CREDITO" };
      const sol = { filialId: "f999" };
      expect(canViewSolicitacao(user, sol)).toBe(true);
    });
  });

  describe("canDevolverGerente", () => {
    it("Gerente pode devolver solicitação ENVIADO_GERENTE de sua filial", () => {
      const user = { role: "GERENTE", filialId: "f1" };
      const sol = { filialId: "f1", status: "ENVIADO_GERENTE" };
      expect(canDevolverGerente(user, sol)).toBe(true);
    });

    it("Gerente não pode devolver solicitação de outra filial", () => {
      const user = { role: "GERENTE", filialId: "f1" };
      const sol = { filialId: "f2", status: "ENVIADO_GERENTE" };
      expect(canDevolverGerente(user, sol)).toBe(false);
    });

    it("Gerente não pode devolver em estado inválido", () => {
      const user = { role: "GERENTE", filialId: "f1" };
      const sol = { filialId: "f1", status: "APROVADO" };
      expect(canDevolverGerente(user, sol)).toBe(false);
    });
  });

  // ... mais testes
});
```

- [ ] Cobertura ≥ 90% das funções RBAC
- [ ] Todos os casos negativos testados
- [ ] Testes parametrizados para múltiplas filiais

### Testes E2E

```typescript
// cypress/e2e/fluxo-completo.cy.ts

describe("Fluxo Completo — Solicitação de Crédito", () => {
  it("Consultor cria, Gerente devove, Crédito aprova", () => {
    // 1. Consultor login
    cy.login("consultor@tchê.com", "senha123");
    cy.contains("Dashboard do Consultor").should("exist");

    // 2. Criar nova solicitação
    cy.contains("Nova Solicitação").click();
    cy.get("[name=nomeCliente]").type("Fazenda ABC");
    cy.get("[name=cpfCnpj]").type("12.345.678/0001-90");
    
    // ... preench todos os campos
    
    // 3. Enviar ao gerente
    cy.contains("Próxima Etapa").click();
    // ... próximas etapas
    cy.contains("Enviar ao Gerente").click();
    cy.contains("Confirmar").click();
    cy.contains("Enviado com sucesso").should("exist");

    // 4. Logout consultor
    cy.logout();

    // 5. Gerente login
    cy.login("gerente@tchê.com", "senha123");
    cy.contains("Dashboard do Gerente").should("exist");
    cy.contains("Solicitações Pendentes").click();
    cy.contains("Fazenda ABC").click();

    // 6. Ler parecer do consultor
    cy.get("[data-testid=parecer-consultor]").should("contain", "texto do parecer");

    // 7. Deixar parecer próprio
    cy.get("[data-testid=meu-parecer]").type("Aprovado por mim");
    cy.contains("Salvar Parecer").click();

    // 8. Devolver
    cy.contains("Devolver").click();
    cy.get("[data-testid=motivo-devolucao]")
      .type("Faltam documentos de propriedade");
    cy.contains("Confirmar Devolução").click();
    cy.contains("Devolvido com sucesso").should("exist");

    // 9. Logout gerente
    cy.logout();

    // 10. Consultor corrige
    cy.login("consultor@tchê.com", "senha123");
    cy.contains("Devolvidas").click();
    cy.contains("Fazenda ABC").click();
    
    // Ver motivo de devolução
    cy.contains("Faltam documentos de propriedade").should("exist");
    
    // Anexar documento
    cy.contains("Documentos").click();
    cy.get("[data-testid=upload-doc]").selectFile("doc.pdf");
    
    // Reenvia
    cy.contains("Reenviar ao Gerente").click();
    cy.contains("Reenviado com sucesso").should("exist");

    // ... continua com gerente e crédito
  });
});
```

- [ ] E2E com 17 passos documentados
- [ ] Testes de negação de acesso (RBAC)
- [ ] Testes de devolução com motivo
- [ ] Testes de pareceres em cascata

---

## VI. SEGURANÇA — CHECKLIST CRÍTICO

- [ ] Senhas hash com bcrypt (min 12 rounds)
- [ ] HTTPS em produção (min TLS 1.3)
- [ ] CORS configurado corretamente
- [ ] CSRF token em formulários POST
- [ ] Rate limiting em endpoints sensíveis
- [ ] SQL injection prevenido (prepared statements)
- [ ] XSS prevenido (sanitização de inputs)
- [ ] Secrets nunca em código (use .env)
- [ ] Logs não vazam PII/dados sensíveis
- [ ] Webhook do Clicksign validado (verificar assinatura)
- [ ] Auditoria registra: WHO, WHAT, WHEN, WHY
- [ ] Permissões testadas (negação deve falhar)

---

## VII. OBSERVABILIDADE — CHECKLIST

- [ ] Logs estruturados (JSON)
- [ ] Níveis: DEBUG, INFO, WARN, ERROR, FATAL
- [ ] Rastreamento de solicitações (request ID)
- [ ] Métricas: latência, throughput, erros
- [ ] Health check endpoint
- [ ] Alertas em erro 5xx
- [ ] Alertas em webhook failado
- [ ] Dashboard de monitoramento

---

## VIII. PERFORMANCE — CHECKLIST

- [ ] Índices no banco (filialId, status, consultorId)
- [ ] Paginação em listas (padrão 20 items)
- [ ] Cache de permissões do usuário (TTL 5min)
- [ ] Lazy loading em documentos
- [ ] Compressão gzip em respostas
- [ ] CDN para arquivos estáticos
- [ ] Viewport mobile ≤ 3s (FCP)
- [ ] Desktop ≤ 1s (FCP)

---

**Próximo passo:** Validar com o time e providenciar especificações 03, 04, 05, 06.
