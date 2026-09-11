import type { CreditRequestStatus } from '../types/credit-request-status'
import type { Role } from '../types/role'

export type WorkflowActionKind =
  'SUBMIT' | 'RETURN' | 'APPROVE' | 'REJECT' | 'CANCEL'

export interface WorkflowActionOption {
  action: WorkflowActionKind
  label: string
  variant: 'primary' | 'danger'
  targets?: { value: CreditRequestStatus; label: string }[]
}

interface TransitionRule {
  action: WorkflowActionKind
  from: CreditRequestStatus
  roles: Role[]
  requiresOwnership?: boolean
  label: string
  variant: 'primary' | 'danger'
  targets?: { value: CreditRequestStatus; label: string }[]
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
  },
  {
    action: 'SUBMIT',
    from: 'RETURNED_TO_MANAGER',
    roles: ['GERENTE'],
    label: 'Reiniciar análise',
    variant: 'primary',
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
    label: 'Devolver',
    variant: 'danger',
    targets: [
      { value: 'RETURNED_TO_MANAGER', label: 'Gerente' },
      { value: 'RETURNED_TO_CONSULTANT', label: 'Consultor' },
    ],
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
  }).map(({ action, label, variant, targets }) => ({
    action,
    label,
    variant,
    targets,
  }))
}
