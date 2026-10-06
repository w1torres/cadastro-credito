import type { CreditRequestStatus } from '../types/credit-request-status'
import type { Role } from '../types/role'

export type WorkflowActionKind =
  'SUBMIT' | 'RETURN' | 'APPROVE' | 'REJECT' | 'CANCEL'

export interface WorkflowActionOption {
  action: WorkflowActionKind
  label: string
  variant: 'primary' | 'danger'
  targets?: { value: CreditRequestStatus; label: string }[]
  /** Só pede observação/parecer quando a ação realmente encaminha a solicitação para a próxima etapa/papel. */
  requiresObservation: boolean
}

interface TransitionRule {
  action: WorkflowActionKind
  from: CreditRequestStatus
  roles: Role[]
  requiresOwnership?: boolean
  label: string
  variant: 'primary' | 'danger'
  targets?: { value: CreditRequestStatus; label: string }[]
  /** `false` para ações que só "assumem" a solicitação (iniciar/reiniciar análise) sem encaminhá-la a ninguém — padrão `true`. */
  requiresObservation?: boolean
}

/**
 * Espelha `backend/src/credit-requests/workflow.types.ts` (`TRANSITIONS`) só para decidir quais
 * botões mostrar — a autorização de verdade é sempre revalidada pelo backend.
 */
const RULES: TransitionRule[] = [
  {
    action: 'SUBMIT',
    from: 'DRAFT',
    roles: ['CONSULTOR'],
    requiresOwnership: true,
    label: 'Enviar para gerente',
    variant: 'primary',
  },
  {
    action: 'SUBMIT',
    from: 'RETURNED_TO_CONSULTANT',
    roles: ['CONSULTOR'],
    requiresOwnership: true,
    label: 'Enviar para gerente',
    variant: 'primary',
  },
  {
    action: 'SUBMIT',
    from: 'SUBMITTED_TO_MANAGER',
    roles: ['GERENTE'],
    label: 'Iniciar análise',
    variant: 'primary',
    requiresObservation: false,
  },
  {
    action: 'SUBMIT',
    from: 'MANAGER_REVIEW',
    roles: ['GERENTE'],
    label: 'Enviar para crédito',
    variant: 'primary',
  },
  {
    action: 'SUBMIT',
    from: 'SUBMITTED_TO_CREDIT',
    roles: ['CREDITO'],
    label: 'Iniciar análise',
    variant: 'primary',
    requiresObservation: false,
  },
  {
    action: 'SUBMIT',
    from: 'RETURNED_TO_MANAGER',
    roles: ['GERENTE'],
    label: 'Reiniciar análise',
    variant: 'primary',
    requiresObservation: false,
  },

  {
    action: 'RETURN',
    from: 'MANAGER_REVIEW',
    roles: ['GERENTE'],
    label: 'Devolver ao consultor',
    variant: 'danger',
  },
  {
    action: 'RETURN',
    from: 'CREDIT_REVIEW',
    roles: ['CREDITO'],
    label: 'Devolver ao gerente',
    variant: 'danger',
    targets: [{ value: 'RETURNED_TO_MANAGER', label: 'Gerente' }],
  },

  {
    action: 'APPROVE',
    from: 'CREDIT_REVIEW',
    roles: ['CREDITO'],
    label: 'Aprovar',
    variant: 'primary',
  },
  {
    action: 'REJECT',
    from: 'CREDIT_REVIEW',
    roles: ['CREDITO'],
    label: 'Reprovar',
    variant: 'danger',
  },

  {
    action: 'CANCEL',
    from: 'SUBMITTED_TO_MANAGER',
    roles: ['CONSULTOR'],
    requiresOwnership: true,
    label: 'Cancelar',
    variant: 'danger',
  },
  {
    action: 'CANCEL',
    from: 'MANAGER_REVIEW',
    roles: ['CONSULTOR'],
    requiresOwnership: true,
    label: 'Cancelar',
    variant: 'danger',
  },
  {
    action: 'CANCEL',
    from: 'RETURNED_TO_CONSULTANT',
    roles: ['CONSULTOR'],
    requiresOwnership: true,
    label: 'Cancelar',
    variant: 'danger',
  },
  {
    action: 'CANCEL',
    from: 'SUBMITTED_TO_CREDIT',
    roles: ['CONSULTOR'],
    requiresOwnership: true,
    label: 'Cancelar',
    variant: 'danger',
  },
  {
    action: 'CANCEL',
    from: 'CREDIT_REVIEW',
    roles: ['CONSULTOR'],
    requiresOwnership: true,
    label: 'Cancelar',
    variant: 'danger',
  },
  {
    action: 'CANCEL',
    from: 'RETURNED_TO_MANAGER',
    roles: ['CONSULTOR'],
    requiresOwnership: true,
    label: 'Cancelar',
    variant: 'danger',
  },
]

export function getAvailableActions(
  status: CreditRequestStatus,
  role: Role,
  isOwner: boolean,
): WorkflowActionOption[] {
  return RULES.filter((rule) => {
    if (rule.from !== status) return false
    if (role === 'ADMIN') return true
    if (!rule.roles.includes(role)) return false
    if (rule.requiresOwnership && !isOwner) return false
    return true
  }).map(({ action, label, variant, targets, requiresObservation }) => ({
    action,
    label,
    variant,
    targets,
    requiresObservation: requiresObservation ?? true,
  }))
}

/**
 * Espelho de `ETAPAS_EDICAO_*` e `podeEditarCadastro` do backend
 * (backend/src/credit-requests/workflow.types.ts) — manter as duas em sincronia.
 */
export const ETAPAS_EDICAO_CONSULTOR: CreditRequestStatus[] = [
  'DRAFT',
  'RETURNED_TO_CONSULTANT',
]
export const ETAPAS_EDICAO_GERENTE: CreditRequestStatus[] = [
  'RETURNED_TO_MANAGER',
]

export function podeEditarCadastro(params: {
  status: CreditRequestStatus
  role: Role
  isOwner: boolean
  mesmaFilial: boolean
}): boolean {
  const { status, role, isOwner, mesmaFilial } = params
  if (role === 'ADMIN') {
    return (
      ETAPAS_EDICAO_CONSULTOR.includes(status) ||
      ETAPAS_EDICAO_GERENTE.includes(status)
    )
  }
  if (role === 'CONSULTOR')
    return isOwner && ETAPAS_EDICAO_CONSULTOR.includes(status)
  if (role === 'GERENTE')
    return mesmaFilial && ETAPAS_EDICAO_GERENTE.includes(status)
  return false
}
