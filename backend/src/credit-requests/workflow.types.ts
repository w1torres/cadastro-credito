import {
  CreditRequestStatus,
  DocumentPendencyMotivo,
  DocumentType,
  Role,
} from '@prisma/client';

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
  /**
   * Exige uma SignatureRequest com status SIGNED (autorização de consulta
   * SPC/Bacen assinada pelo cliente via Clicksign, ver signatures/) antes de
   * liberar a transição — Fase 6.
   */
  requiresSignedAuthorization?: boolean;
  /**
   * Exige ficha cadastral APROVADA e nenhum documento pendente marcado pelo
   * GERENTE/CREDITO antes de enviar a solicitação ao CREDITO.
   */
  requiresFichaAprovadaSemPendencias?: boolean;
  /** Exige que não haja documentos pendentes (envio do consultor). */
  requiresSemPendencias?: boolean;
}

export interface TransitionInput {
  expectedUpdatedAt: string;
  reason?: string;
  targetStatus?: CreditRequestStatus;
  /** Só usado na devolução: substitui as pendências de documento da solicitação. */
  pendencias?: { type: DocumentType; motivo: DocumentPendencyMotivo }[];
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
    requiresSignedAuthorization: true,
    requiresSemPendencias: true,
  },
  {
    action: 'SUBMIT',
    from: RETURNED_TO_CONSULTANT,
    to: SUBMITTED_TO_MANAGER,
    roles: [CONSULTOR],
    requiresOwnership: true,
    requiresSignedAuthorization: true,
    requiresSemPendencias: true,
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
    requiresFichaAprovadaSemPendencias: true,
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

/**
 * Matriz de edição do cadastro e de upload de documentos (ver
 * docs/PROMPT_CORRECAO_FLUXO_CREDITO.md). Suposição a confirmar com o negócio:
 * o gerente só edita na devolução do crédito (RETURNED_TO_MANAGER); durante a
 * própria análise (SUBMITTED_TO_MANAGER/MANAGER_REVIEW) fica somente leitura.
 */
export const ETAPAS_EDICAO_CONSULTOR: CreditRequestStatus[] = [
  CreditRequestStatus.DRAFT,
  CreditRequestStatus.RETURNED_TO_CONSULTANT,
];
export const ETAPAS_EDICAO_GERENTE: CreditRequestStatus[] = [
  CreditRequestStatus.RETURNED_TO_MANAGER,
];

export interface PermissaoEdicao {
  status: CreditRequestStatus;
  role: Role;
  /** O usuário é o consultor dono da solicitação. */
  isOwner: boolean;
  /** O consultor da solicitação pertence à mesma filial do usuário (GERENTE). */
  mesmaFilial: boolean;
}

/** Fonte única: quem pode alterar o cadastro e anexar documentos, e em qual etapa. */
export function podeEditarCadastro(permissao: PermissaoEdicao): boolean {
  const { status, role, isOwner, mesmaFilial } = permissao;
  if (role === Role.ADMIN) {
    return (
      ETAPAS_EDICAO_CONSULTOR.includes(status) || ETAPAS_EDICAO_GERENTE.includes(status)
    );
  }
  if (role === Role.CONSULTOR) {
    return isOwner && ETAPAS_EDICAO_CONSULTOR.includes(status);
  }
  if (role === Role.GERENTE) {
    return mesmaFilial && ETAPAS_EDICAO_GERENTE.includes(status);
  }
  return false;
}

