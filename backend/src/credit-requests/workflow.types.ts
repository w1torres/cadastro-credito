import { CreditRequestStatus, Role } from '@prisma/client';

export type WorkflowAction =
  'SUBMIT' | 'RETURN' | 'APPROVE' | 'REJECT' | 'CANCEL';

export interface TransitionRule {
  action: WorkflowAction;
  from: CreditRequestStatus;
  to: CreditRequestStatus;
  roles: Role[];
  requiresOwnership?: boolean;
  requiresReason?: boolean;
  requiresMinProperty?: boolean;
}

export interface TransitionInput {
  expectedUpdatedAt: string;
  reason?: string;
  targetStatus?: CreditRequestStatus;
}

const {
  DRAFT,
  SUBMITTED_TO_MANAGER,
  MANAGER_REVIEW,
  RETURNED_TO_CONSULTANT,
  SUBMITTED_TO_CREDIT,
  CREDIT_REVIEW,
  RETURNED_TO_MANAGER,
  APPROVED,
  REJECTED,
  CANCELLED,
} = CreditRequestStatus;
const { CONSULTOR, GERENTE, CREDITO } = Role;

/**
 * Tabela de transições — fonte única de verdade da máquina de estados
 * (spec 03: "Implementar serviço dedicado: WorkflowService. Evitar espalhar
 * regras de workflow por controllers."). `ADMIN` não aparece aqui: age como
 * superusuário e é tratado à parte em `WorkflowService` (ignora `roles` e
 * `requiresOwnership`, mas não pode sair deste grafo).
 */
export const TRANSITIONS: TransitionRule[] = [
  {
    action: 'SUBMIT',
    from: DRAFT,
    to: SUBMITTED_TO_MANAGER,
    roles: [CONSULTOR],
    requiresOwnership: true,
    requiresMinProperty: true,
  },
  {
    action: 'SUBMIT',
    from: RETURNED_TO_CONSULTANT,
    to: SUBMITTED_TO_MANAGER,
    roles: [CONSULTOR],
    requiresOwnership: true,
  },
  {
    action: 'SUBMIT',
    from: SUBMITTED_TO_MANAGER,
    to: MANAGER_REVIEW,
    roles: [GERENTE],
  },
  {
    action: 'SUBMIT',
    from: MANAGER_REVIEW,
    to: SUBMITTED_TO_CREDIT,
    roles: [GERENTE],
  },
  {
    action: 'SUBMIT',
    from: SUBMITTED_TO_CREDIT,
    to: CREDIT_REVIEW,
    roles: [CREDITO],
  },
  {
    action: 'SUBMIT',
    from: RETURNED_TO_MANAGER,
    to: MANAGER_REVIEW,
    roles: [GERENTE],
  },

  {
    action: 'RETURN',
    from: MANAGER_REVIEW,
    to: RETURNED_TO_CONSULTANT,
    roles: [GERENTE],
    requiresReason: true,
  },
  {
    action: 'RETURN',
    from: CREDIT_REVIEW,
    to: RETURNED_TO_MANAGER,
    roles: [CREDITO],
    requiresReason: true,
  },
  {
    action: 'RETURN',
    from: CREDIT_REVIEW,
    to: RETURNED_TO_CONSULTANT,
    roles: [CREDITO],
    requiresReason: true,
  },

  { action: 'APPROVE', from: CREDIT_REVIEW, to: APPROVED, roles: [CREDITO] },

  {
    action: 'REJECT',
    from: CREDIT_REVIEW,
    to: REJECTED,
    roles: [CREDITO],
    requiresReason: true,
  },

  {
    action: 'CANCEL',
    from: SUBMITTED_TO_MANAGER,
    to: CANCELLED,
    roles: [CONSULTOR],
    requiresOwnership: true,
  },
  {
    action: 'CANCEL',
    from: MANAGER_REVIEW,
    to: CANCELLED,
    roles: [CONSULTOR],
    requiresOwnership: true,
  },
  {
    action: 'CANCEL',
    from: RETURNED_TO_CONSULTANT,
    to: CANCELLED,
    roles: [CONSULTOR],
    requiresOwnership: true,
  },
  {
    action: 'CANCEL',
    from: SUBMITTED_TO_CREDIT,
    to: CANCELLED,
    roles: [CONSULTOR],
    requiresOwnership: true,
  },
  {
    action: 'CANCEL',
    from: CREDIT_REVIEW,
    to: CANCELLED,
    roles: [CONSULTOR],
    requiresOwnership: true,
  },
  {
    action: 'CANCEL',
    from: RETURNED_TO_MANAGER,
    to: CANCELLED,
    roles: [CONSULTOR],
    requiresOwnership: true,
  },
];
