# Exemplos de Código Prático — Implementação de RBAC e Fluxo

**Projeto:** Tchê Agrícola — Solicitação de Crédito  
**Versão:** 1.0  
**Data:** 2026-09-15

---

## I. AJUSTES NO HTML EXISTENTE

### 1. Modal de Devolução (Adicionar ao final do HTML)

```html
<!-- Modal Devolução -->
<div id="modalDevolucao" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
  <div class="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4">
    <div class="bg-gradient-to-r from-green-700 to-green-400 px-6 py-4 text-white">
      <h2 class="text-xl font-bold">Devolver Solicitação</h2>
      <p class="text-sm text-green-100 mt-1">Descreva os motivos da devolução</p>
    </div>

    <div class="p-6 space-y-4">
      <!-- Motivo (obrigatório) -->
      <div>
        <label class="block text-sm font-semibold mb-2">
          Motivo da Devolução <span class="text-red-500">*</span>
        </label>
        <textarea
          id="motivoDevolucao"
          class="w-full border border-gray-300 rounded px-4 py-2 text-sm"
          rows="5"
          placeholder="Exemplo: Faltam documentos de propriedade&#10;Comprovante de renda desatualizado"
        ></textarea>
        <span id="erroMotivo" class="text-red-500 text-xs hidden mt-1">
          Motivo obrigatório
        </span>
      </div>

      <!-- Destinatário -->
      <div>
        <label class="block text-sm font-semibold mb-2">Devolver para</label>
        <div class="space-y-2">
          <div class="flex items-center">
            <input
              type="radio"
              id="devConsultor"
              name="destinatario"
              value="CONSULTOR"
              class="checkbox-custom"
              checked
            >
            <label for="devConsultor" class="ml-2 text-sm">
              Consultor (para correção)
            </label>
          </div>
          <div class="flex items-center" id="devGerenteWrapper" style="display: none;">
            <input
              type="radio"
              id="devGerente"
              name="destinatario"
              value="GERENTE"
              class="checkbox-custom"
            >
            <label for="devGerente" class="ml-2 text-sm">
              Gerente da Filial (revisão)
            </label>
          </div>
        </div>
      </div>

      <!-- Info: Motivo será registrado no histórico -->
      <div class="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-700">
        <strong>ℹ️ Aviso:</strong> Este motivo será registrado no histórico e visível para o destinatário.
      </div>
    </div>

    <!-- Botões -->
    <div class="bg-gray-100 px-6 py-4 flex gap-3 justify-end rounded-b-lg">
      <button
        id="btnCancelaDevolucao"
        class="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-semibold"
      >
        Cancelar
      </button>
      <button
        id="btnConfirmaDevolucao"
        class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        disabled
      >
        Confirmar Devolução
      </button>
    </div>
  </div>
</div>

<script>
// Controlar validação do motivo
const motivoInput = document.getElementById("motivoDevolucao");
const btnConfirma = document.getElementById("btnConfirmaDevolucao");
const erroMotivo = document.getElementById("erroMotivo");

motivoInput?.addEventListener("input", () => {
  const temMotivo = motivoInput.value.trim().length > 0;
  btnConfirma.disabled = !temMotivo;
  
  if (temMotivo) {
    erroMotivo.classList.add("hidden");
  }
});

btnConfirma?.addEventListener("click", () => {
  const motivo = motivoInput.value.trim();
  if (!motivo) {
    erroMotivo.classList.remove("hidden");
    return;
  }

  const destinatario = document.querySelector(
    'input[name="destinatario"]:checked'
  ).value;

  console.log("Devolução:", { motivo, destinatario });
  // TODO: chamar API POST /api/solicitacoes/:id/devolver
  
  alert("Devolução registrada com sucesso!");
  document.getElementById("modalDevolucao").classList.add("hidden");
});

document.getElementById("btnCancelaDevolucao")?.addEventListener("click", () => {
  document.getElementById("modalDevolucao").classList.add("hidden");
});
</script>
```

---

### 2. Seção de Pareceres (Substituir seção vazia)

```html
<section>
  <h2 class="section-header text-xl font-bold px-6 py-3 rounded-t-lg">
    6 — PARECERES DO WORKFLOW
  </h2>
  <div class="border border-t-0 border-gray-300 rounded-b-lg p-6 space-y-6">
    
    <!-- Parecer do Consultor (sempre visível se enviado) -->
    <div class="border border-green-300 bg-green-50 rounded-lg p-4">
      <div class="flex items-start justify-between">
        <div>
          <h3 class="font-semibold text-green-900">Parecer do Consultor</h3>
          <p class="text-sm text-green-700 mt-1">
            <strong>Autor:</strong> João Silva
            <br>
            <strong>Data:</strong> 15/09/2026 às 14:30
          </p>
        </div>
        <span class="bg-green-200 text-green-900 px-3 py-1 rounded-full text-xs font-semibold">
          Preenchido
        </span>
      </div>
      <div class="mt-3 p-3 bg-white border border-green-200 rounded text-sm text-gray-700">
        "Cliente é idôneo, propriedade está em dia com documentação, produção está adequada 
        para o tipo de crédito solicitado. Recomendo aprovação."
      </div>
    </div>

    <!-- Parecer do Gerente (visível para gerente + crédito) -->
    <div id="parecer-gerente-wrapper" class="border border-blue-300 bg-blue-50 rounded-lg p-4">
      <div class="flex items-start justify-between">
        <div>
          <h3 class="font-semibold text-blue-900">Parecer do Gerente da Filial</h3>
          <p class="text-sm text-blue-700 mt-1">
            <strong>Autor:</strong> Maria Santos (Gerente Filial A)
            <br>
            <strong>Data:</strong> 15/09/2026 às 15:45
          </p>
        </div>
        <span class="bg-blue-200 text-blue-900 px-3 py-1 rounded-full text-xs font-semibold">
          Preenchido
        </span>
      </div>
      <div class="mt-3 p-3 bg-white border border-blue-200 rounded text-sm text-gray-700">
        "Validei os dados do cliente. Documentação completa. Concordo com parecer do 
        consultor. Cliente tem histórico positivo conosco."
      </div>
    </div>

    <!-- Meu Parecer (pode ser preenchido por gerente ou crédito) -->
    <div id="meu-parecer-wrapper" class="border border-yellow-300 bg-yellow-50 rounded-lg p-4">
      <div class="flex items-center justify-between mb-3">
        <div>
          <h3 class="font-semibold text-yellow-900">Meu Parecer</h3>
          <p class="text-sm text-yellow-700 mt-1">
            Role: <span id="meuParecerRole">Gerente da Filial A</span>
          </p>
        </div>
        <span id="statusMeuParecer" class="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold">
          Em edição
        </span>
      </div>
      <textarea
        id="meuParecer"
        class="w-full border border-yellow-300 rounded px-4 py-2 text-sm"
        rows="5"
        placeholder="Digite seu parecer aqui..."
      ></textarea>
      <div class="mt-3 flex gap-2 justify-end">
        <button
          id="btnSalvarParecer"
          class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold"
        >
          Salvar Parecer
        </button>
        <button
          id="btnCancelarParecer"
          class="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-semibold"
        >
          Cancelar
        </button>
      </div>
    </div>

    <!-- Timeline de Pareceres -->
    <div class="border border-gray-300 rounded-lg p-4">
      <h3 class="font-semibold mb-3">Histórico</h3>
      <div class="space-y-2 text-sm">
        <div class="flex gap-3 pb-2 border-b">
          <div class="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <p class="font-semibold">Parecer do Consultor adicionado</p>
            <p class="text-gray-600">15/09/2026 às 14:30 por João Silva</p>
          </div>
        </div>
        <div class="flex gap-3 pb-2 border-b">
          <div class="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <p class="font-semibold">Parecer do Gerente adicionado</p>
            <p class="text-gray-600">15/09/2026 às 15:45 por Maria Santos</p>
          </div>
        </div>
        <div class="flex gap-3">
          <div class="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <p class="font-semibold text-gray-600">Aguardando parecer do Gerente de Crédito</p>
            <p class="text-gray-600">-</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<script>
document.getElementById("btnSalvarParecer")?.addEventListener("click", () => {
  const parecer = document.getElementById("meuParecer").value;
  if (!parecer.trim()) {
    alert("Parecer não pode estar vazio");
    return;
  }
  console.log("Salvando parecer:", parecer);
  // TODO: chamar API POST /api/solicitacoes/:id/pareceres
  alert("Parecer salvo com sucesso!");
});
</script>
```

---

### 3. Timeline de Eventos (Adicionar em novo link de abas)

```html
<!-- Botões de abas (adicionar no topo) -->
<div class="flex gap-2 border-b border-gray-300 mb-4 no-print">
  <button class="tab-btn active px-4 py-2 border-b-2 border-green-600 font-semibold text-green-600">
    📋 Solicitação
  </button>
  <button class="tab-btn px-4 py-2 text-gray-700 hover:text-gray-900">
    📜 Documentos
  </button>
  <button class="tab-btn px-4 py-2 text-gray-700 hover:text-gray-900">
    💬 Pareceres
  </button>
  <button class="tab-btn px-4 py-2 text-gray-700 hover:text-gray-900">
    📅 Timeline
  </button>
  <button class="tab-btn px-4 py-2 text-gray-700 hover:text-gray-900">
    ✍️ Assinatura
  </button>
</div>

<!-- Aba Timeline -->
<div id="tab-timeline" class="tab-content hidden">
  <section>
    <h2 class="section-header text-xl font-bold px-6 py-3 rounded-t-lg">
      TIMELINE DE EVENTOS
    </h2>
    <div class="border border-t-0 border-gray-300 rounded-b-lg p-6">
      <div class="space-y-4">
        <!-- Evento 1 -->
        <div class="flex gap-4">
          <div class="flex flex-col items-center">
            <div class="w-4 h-4 bg-green-600 rounded-full mt-1"></div>
            <div class="w-0.5 h-12 bg-gray-300"></div>
          </div>
          <div class="pb-4">
            <p class="font-semibold text-gray-900">Solicitação Criada</p>
            <p class="text-sm text-gray-600">15/09/2026 às 10:30</p>
            <p class="text-sm text-gray-700 mt-1">Por: João Silva (Consultor)</p>
            <p class="text-sm text-gray-600 mt-1">Status: RASCUNHO</p>
          </div>
        </div>

        <!-- Evento 2 -->
        <div class="flex gap-4">
          <div class="flex flex-col items-center">
            <div class="w-4 h-4 bg-green-600 rounded-full mt-1"></div>
            <div class="w-0.5 h-12 bg-gray-300"></div>
          </div>
          <div class="pb-4">
            <p class="font-semibold text-gray-900">Enviado ao Gerente</p>
            <p class="text-sm text-gray-600">15/09/2026 às 14:00</p>
            <p class="text-sm text-gray-700 mt-1">Por: João Silva (Consultor)</p>
            <p class="text-sm text-gray-600 mt-1">Status: ENVIADO_GERENTE</p>
          </div>
        </div>

        <!-- Evento 3 -->
        <div class="flex gap-4">
          <div class="flex flex-col items-center">
            <div class="w-4 h-4 bg-blue-600 rounded-full mt-1"></div>
            <div class="w-0.5 h-12 bg-gray-300"></div>
          </div>
          <div class="pb-4">
            <p class="font-semibold text-gray-900">Parecer do Gerente Adicionado</p>
            <p class="text-sm text-gray-600">15/09/2026 às 15:45</p>
            <p class="text-sm text-gray-700 mt-1">Por: Maria Santos (Gerente Filial A)</p>
          </div>
        </div>

        <!-- Evento 4 - Futuro -->
        <div class="flex gap-4 opacity-50">
          <div class="flex flex-col items-center">
            <div class="w-4 h-4 bg-gray-400 rounded-full mt-1"></div>
          </div>
          <div>
            <p class="font-semibold text-gray-500">Aguardando próxima ação</p>
            <p class="text-sm text-gray-400">-</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>

<script>
// Controlar abas
document.querySelectorAll(".tab-btn").forEach((btn, idx) => {
  btn.addEventListener("click", () => {
    // Remove active de todos
    document.querySelectorAll(".tab-btn").forEach(b => {
      b.classList.remove("active", "border-b-2", "border-green-600", "font-semibold", "text-green-600");
      b.classList.add("text-gray-700", "hover:text-gray-900");
    });

    // Remove visibilidade de todas as abas
    document.querySelectorAll(".tab-content").forEach(c => {
      c.classList.add("hidden");
    });

    // Ativa a selecionada
    btn.classList.add("active", "border-b-2", "border-green-600", "font-semibold", "text-green-600");
    btn.classList.remove("text-gray-700", "hover:text-gray-900");
    
    // TODO: mapear índice para ID de conteúdo
    const contentId = ["tab-solicitacao", "tab-documentos", "tab-pareceres", "tab-timeline", "tab-assinatura"][idx];
    document.getElementById(contentId)?.classList.remove("hidden");
  });
});
</script>
```

---

## II. COMPONENTES REACT

### 1. Hook: `useRBAC` (Autorização)

```typescript
// src/hooks/useRBAC.ts

import { useAuth } from './useAuth';
import { Solicitacao, User } from '@/types';

export function useRBAC() {
  const { user } = useAuth();

  const can = {
    viewSolicitacao: (sol: Solicitacao) => {
      if (!user) return false;
      if (user.role === 'GERENTE_CREDITO') return true;
      if (user.role === 'GERENTE' && user.filialId === sol.filialId) return true;
      if (user.role === 'CONSULTOR' && user.id === sol.consultorId) return true;
      return false;
    },

    editSolicitacao: (sol: Solicitacao) => {
      if (!user || user.role !== 'CONSULTOR') return false;
      if (user.id !== sol.consultorId) return false;
      if (!['RASCUNHO', 'DEVOLVIDO_GERENTE', 'DEVOLVIDO_CREDITO_GERENTE'].includes(sol.status)) {
        return false;
      }
      return true;
    },

    devolver: (sol: Solicitacao) => {
      if (!user) return false;
      
      if (user.role === 'GERENTE') {
        return user.filialId === sol.filialId && sol.status === 'ENVIADO_GERENTE';
      }
      
      if (user.role === 'GERENTE_CREDITO') {
        return sol.status === 'ENVIADO_CREDITO';
      }
      
      return false;
    },

    enviarAoCredito: (sol: Solicitacao) => {
      if (!user || user.role !== 'GERENTE') return false;
      if (user.filialId !== sol.filialId) return false;
      if (sol.status !== 'ENVIADO_GERENTE') return false;
      return true;
    },

    aprovar: (sol: Solicitacao) => {
      if (!user || user.role !== 'GERENTE_CREDITO') return false;
      if (!['ENVIADO_CREDITO'].includes(sol.status)) return false;
      return true;
    },

    deixarParecer: (sol: Solicitacao) => {
      if (!user) return false;
      const roles = ['CONSULTOR', 'GERENTE', 'GERENTE_CREDITO'];
      return roles.includes(user.role);
    },

    verParecer: (sol: Solicitacao, pareceRole: string) => {
      if (!user) return false;

      // Consultor vê seu próprio parecer
      if (pareceRole === 'CONSULTOR' && user.role === 'CONSULTOR') return true;

      // Gerente vê pareceres do consultor e seu próprio
      if (user.role === 'GERENTE') {
        return ['CONSULTOR', 'GERENTE'].includes(pareceRole);
      }

      // Crédito vê todos
      if (user.role === 'GERENTE_CREDITO') return true;

      return false;
    },
  };

  return { can };
}
```

---

### 2. Componente: `ListaSolicitacoes` (Resumo)

```typescript
// src/features/solicitacoes/components/ListaSolicitacoes.tsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRBAC } from '@/hooks/useRBAC';
import { Solicitacao } from '@/types';
import { formatDate, formatCurrency } from '@/lib/format';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ModalDetalhes } from './ModalDetalhes';
import { ModalPendencia } from './ModalPendencia';

export function ListaSolicitacoes() {
  const { can } = useRBAC();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalPendencia, setModalPendencia] = useState<string | null>(null);

  const { data: solicitacoes, isLoading } = useQuery({
    queryKey: ['solicitacoes'],
    queryFn: async () => {
      const res = await fetch('/api/solicitacoes');
      return res.json() as Promise<Solicitacao[]>;
    },
  });

  if (isLoading) return <div>Carregando...</div>;
  if (!solicitacoes) return <div>Erro ao carregar</div>;

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b-2 border-gray-300">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Cliente
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Data de Criação
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Status
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">
                Ação
              </th>
            </tr>
          </thead>
          <tbody>
            {solicitacoes.map((sol) => (
              <tr key={sol.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900">
                  {sol.nomeCliente}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {formatDate(sol.dataCriacao)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={sol.status} />
                </td>
                <td className="px-4 py-3 text-center">
                  {sol.temPendencia ? (
                    <button
                      onClick={() => setModalPendencia(sol.id)}
                      className="text-blue-600 underline hover:text-blue-800 font-semibold"
                    >
                      Ver Pendência
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedId(sol.id)}
                      className="text-gray-600 underline hover:text-gray-800"
                    >
                      Visualizar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Detalhes */}
      {selectedId && (
        <ModalDetalhes
          solicitacaoId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}

      {/* Modal Pendência */}
      {modalPendencia && (
        <ModalPendencia
          solicitacaoId={modalPendencia}
          onClose={() => setModalPendencia(null)}
        />
      )}
    </>
  );
}
```

---

### 3. Componente: `ModalDevolucao`

```typescript
// src/features/solicitacoes/components/ModalDevolucao.tsx

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup';
import { Label } from '@/components/ui/Label';
import { useToast } from '@/hooks/useToast';

interface ModalDevolucaoProps {
  solicitacaoId: string;
  destinatarios: ('CONSULTOR' | 'GERENTE')[];
  onSuccess?: () => void;
  onClose: () => void;
}

export function ModalDevolucao({
  solicitacaoId,
  destinatarios,
  onSuccess,
  onClose,
}: ModalDevolucaoProps) {
  const [motivo, setMotivo] = useState('');
  const [destinatario, setDestinatario] = useState<string>(destinatarios[0]);
  const { toast } = useToast();

  const devolverMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `/api/solicitacoes/${solicitacaoId}/devolver`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ motivo, destinatario }),
        }
      );
      if (!res.ok) throw new Error('Erro ao devolver');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Solicitação devolvida com sucesso');
      onSuccess?.();
      onClose();
    },
    onError: () => {
      toast.error('Erro ao devolver solicitação');
    },
  });

  const handleConfirm = () => {
    if (!motivo.trim()) {
      toast.error('Motivo obrigatório');
      return;
    }
    devolverMutation.mutate();
  };

  const isValid = motivo.trim().length > 0;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Devolver Solicitação</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Motivo */}
          <div>
            <Label htmlFor="motivo" className="mb-2">
              Motivo da Devolução <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Descreva os motivos..."
              rows={5}
              className="resize-none"
            />
          </div>

          {/* Destinatário */}
          <div>
            <Label>Devolver para</Label>
            <RadioGroup value={destinatario} onValueChange={setDestinatario}>
              {destinatarios.includes('CONSULTOR') && (
                <div className="flex items-center space-x-2 mt-2">
                  <RadioGroupItem value="CONSULTOR" id="consultor" />
                  <Label htmlFor="consultor" className="font-normal">
                    Consultor (para correção)
                  </Label>
                </div>
              )}
              {destinatarios.includes('GERENTE') && (
                <div className="flex items-center space-x-2 mt-2">
                  <RadioGroupItem value="GERENTE" id="gerente" />
                  <Label htmlFor="gerente" className="font-normal">
                    Gerente (para revisão)
                  </Label>
                </div>
              )}
            </RadioGroup>
          </div>

          {/* Aviso */}
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-700">
            <strong>ℹ️ Aviso:</strong> Este motivo será registrado e visível para o destinatário.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isValid || devolverMutation.isPending}
            loading={devolverMutation.isPending}
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

### 4. Componente: `PainelPareceres`

```typescript
// src/features/solicitacoes/components/PainelPareceres.tsx

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useRBAC } from '@/hooks/useRBAC';
import { Solicitacao, Parecer } from '@/types';
import { formatDate } from '@/lib/format';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/hooks/useToast';

interface PainelParecerProps {
  solicitacao: Solicitacao;
  onPareceAdicionado?: () => void;
}

export function PainelPareceres({ solicitacao, onPareceAdicionado }: PainelParecerProps) {
  const { user } = useAuth();
  const { can } = useRBAC();
  const [meuParecer, setMeuParecer] = useState('');
  const { toast } = useToast();

  const { data: pareceres = [] } = useQuery({
    queryKey: ['pareceres', solicitacao.id],
    queryFn: async () => {
      const res = await fetch(`/api/solicitacoes/${solicitacao.id}/pareceres`);
      return res.json() as Promise<Parecer[]>;
    },
  });

  const salvarParecer = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `/api/solicitacoes/${solicitacao.id}/pareceres`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conteudo: meuParecer }),
        }
      );
      if (!res.ok) throw new Error();
      return res.json();
    },
    onSuccess: () => {
      toast.success('Parecer salvo com sucesso');
      setMeuParecer('');
      onPareceAdicionado?.();
    },
    onError: () => {
      toast.error('Erro ao salvar parecer');
    },
  });

  return (
    <div className="space-y-6">
      {/* Exibir pareceres anteriores */}
      {pareceres.map((parecer) => {
        if (!can.verParecer(solicitacao, parecer.perfil)) {
          return null;
        }

        return (
          <Card key={parecer.id} className="border-l-4 border-l-green-600">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">
                  Parecer do{' '}
                  {parecer.perfil === 'CONSULTOR' ? 'Consultor' :
                   parecer.perfil === 'GERENTE' ? 'Gerente' :
                   'Gerente de Crédito'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Autor:</strong> {parecer.autor.nome}
                  <br />
                  <strong>Data:</strong> {formatDate(parecer.dataAtualizacao)}
                </p>
              </div>
              <span className="bg-green-200 text-green-900 px-3 py-1 rounded-full text-xs font-semibold">
                Preenchido
              </span>
            </div>
            <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 whitespace-pre-wrap">
              {parecer.conteudo}
            </div>
          </Card>
        );
      })}

      {/* Meu parecer (se pode deixar) */}
      {can.deixarParecer(solicitacao) && (
        <Card className="border-l-4 border-l-yellow-500">
          <div className="mb-3">
            <h3 className="font-semibold">Meu Parecer</h3>
            <p className="text-sm text-gray-600 mt-1">
              Seu papel: {
                user?.role === 'CONSULTOR' ? 'Consultor' :
                user?.role === 'GERENTE' ? 'Gerente da Filial' :
                'Gerente de Crédito'
              }
            </p>
          </div>
          <Textarea
            value={meuParecer}
            onChange={(e) => setMeuParecer(e.target.value)}
            placeholder="Digite seu parecer..."
            rows={5}
            className="resize-none"
          />
          <div className="mt-3 flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setMeuParecer('')}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => salvarParecer.mutate()}
              disabled={!meuParecer.trim() || salvarParecer.isPending}
              loading={salvarParecer.isPending}
            >
              Salvar Parecer
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
```

---

### 5. Middleware RBAC (Express)

```typescript
// src/middleware/rbac.ts

import { Request, Response, NextFunction } from 'express';
import { Solicitacao, User } from '@/types';

export interface AuthRequest extends Request {
  user: User;
}

export function canViewSolicitacao(
  user: User,
  sol: Solicitacao
): boolean {
  if (user.role === 'GERENTE_CREDITO') return true;
  if (user.role === 'GERENTE' && user.filialId === sol.filialId) return true;
  if (user.role === 'CONSULTOR' && user.id === sol.consultorId) return true;
  return false;
}

export function canEditSolicitacao(
  user: User,
  sol: Solicitacao
): boolean {
  if (user.role !== 'CONSULTOR') return false;
  if (user.id !== sol.consultorId) return false;
  const validStatuses = ['RASCUNHO', 'DEVOLVIDO_GERENTE', 'DEVOLVIDO_CREDITO_GERENTE'];
  if (!validStatuses.includes(sol.status)) return false;
  return true;
}

export function canDevolverGerente(
  user: User,
  sol: Solicitacao
): boolean {
  if (user.role !== 'GERENTE') return false;
  if (user.filialId !== sol.filialId) return false;
  if (sol.status !== 'ENVIADO_GERENTE') return false;
  return true;
}

export function canDevolverCredito(
  user: User,
  sol: Solicitacao
): boolean {
  if (user.role !== 'GERENTE_CREDITO') return false;
  if (sol.status !== 'ENVIADO_CREDITO') return false;
  return true;
}

// Middleware para verificar permissão
export function requireRbac(
  permissionCheck: (user: User, req: AuthRequest) => boolean
) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    if (!permissionCheck(req.user, req)) {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    next();
  };
}
```

---

## III. Exemplos de API (Express + Prisma)

### 1. Endpoint: Devolver Solicitação

```typescript
// src/routes/solicitacoes.ts

router.post(
  '/:id/devolver',
  authenticate,
  requireRbac((user, req) => {
    const id = req.params.id;
    // A validação real acontece no handler
    return ['GERENTE', 'GERENTE_CREDITO'].includes(user.role);
  }),
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { motivo, destinatario } = req.body;

      // Validar motivo
      if (!motivo?.trim()) {
        return res.status(400).json({ error: 'Motivo obrigatório' });
      }

      // Buscar solicitação
      const sol = await db.solicitacao.findUnique({ where: { id } });
      if (!sol) {
        return res.status(404).json({ error: 'Solicitação não encontrada' });
      }

      // Validar permissão específica
      if (req.user.role === 'GERENTE') {
        if (!canDevolverGerente(req.user, sol)) {
          return res.status(403).json({ error: 'Sem permissão para devolver' });
        }
      } else if (req.user.role === 'GERENTE_CREDITO') {
        if (!canDevolverCredito(req.user, sol)) {
          return res.status(403).json({ error: 'Sem permissão para devolver' });
        }
      }

      // Registrar devolução
      const devolucao = await db.devolucao.create({
        data: {
          solicitacaoId: id,
          motivo,
          devolvidoPor: req.user.id,
          devolvido Para: destinatario,
          status: sol.status,
        },
      });

      // Atualizar status da solicitação
      let novoStatus = 'DEVOLVIDO_GERENTE';
      if (req.user.role === 'GERENTE_CREDITO') {
        novoStatus = 'DEVOLVIDO_CREDITO_GERENTE';
      }

      await db.solicitacao.update({
        where: { id },
        data: {
          status: novoStatus,
          ultimaAlteracao: new Date(),
        },
      });

      // Registrar no histórico
      await db.evento.create({
        data: {
          solicitacaoId: id,
          tipo: 'DEVOLVIDA',
          descricao: `Devolvida por ${req.user.nome}: ${motivo}`,
          usuarioId: req.user.id,
        },
      });

      // Enviar email ao consultor/gerente
      // TODO: integrar com serviço de email

      res.json({
        success: true,
        message: 'Solicitação devolvida com sucesso',
        devolucao,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao devolver solicitação' });
    }
  }
);
```

---

## IV. Schema Zod (Validação)

```typescript
// src/schemas/solicitacao.ts

import { z } from 'zod';

export const DevolucaoSchema = z.object({
  motivo: z
    .string()
    .min(10, 'Motivo deve ter pelo menos 10 caracteres')
    .max(500, 'Motivo não pode exceder 500 caracteres'),
  destinatario: z.enum(['CONSULTOR', 'GERENTE']),
});

export const PareceSchema = z.object({
  conteudo: z
    .string()
    .min(5, 'Parecer deve ter pelo menos 5 caracteres')
    .max(2000, 'Parecer não pode exceder 2000 caracteres'),
});

export type Devolucao = z.infer<typeof DevolucaoSchema>;
export type Parecer = z.infer<typeof PareceSchema>;
```

---

**Próximo passo:** Implementar um endpoint de cada vez, testando RBAC em cada etapa.
