import type { Role } from '../types/role'
import type { TimeInBusiness } from '../types/time-in-business'
import type { CreditRequestStatus } from '../types/credit-request-status'
import type { DocumentType } from '../types/document'
import type { SignatureStatus } from '../types/signature'

export const ROLE_LABELS: Record<Role, string> = {
  CONSULTOR: 'Consultor',
  GERENTE: 'Gerente Comercial',
  CREDITO: 'Gerente de Crédito',
  ADMIN: 'Administrador',
}

export const TIME_IN_BUSINESS_LABELS: Record<TimeInBusiness, string> = {
  MORE_THAN_10_YEARS: 'Mais de 10 anos',
  FROM_5_TO_10_YEARS: 'De 5 a 10 anos',
  FROM_3_TO_5_YEARS: 'De 3 a 5 anos',
  LESS_THAN_3_YEARS: 'Menos de 3 anos',
}

export const CREDIT_REQUEST_STATUS_LABELS: Record<CreditRequestStatus, string> =
  {
    DRAFT: 'Rascunho',
    SUBMITTED_TO_MANAGER: 'Aguardando análise (gerente)',
    MANAGER_REVIEW: 'Em análise (gerente)',
    RETURNED_TO_CONSULTANT: 'Devolvido ao consultor',
    SUBMITTED_TO_CREDIT: 'Aguardando análise (crédito)',
    CREDIT_REVIEW: 'Em análise (crédito)',
    RETURNED_TO_MANAGER: 'Devolvido ao gerente',
    APPROVED: 'Aprovado',
    REJECTED: 'Reprovado',
    SIGNATURE_PENDING: 'Aguardando assinatura',
    SIGNED: 'Assinado',
    COMPLETED: 'Concluído',
    CANCELLED: 'Cancelado',
  }

export type StatusBadgeVariant =
  'neutral' | 'info' | 'warning' | 'success' | 'danger'

export const CREDIT_REQUEST_STATUS_VARIANT: Record<
  CreditRequestStatus,
  StatusBadgeVariant
> = {
  DRAFT: 'neutral',
  SUBMITTED_TO_MANAGER: 'info',
  MANAGER_REVIEW: 'warning',
  RETURNED_TO_CONSULTANT: 'danger',
  SUBMITTED_TO_CREDIT: 'info',
  CREDIT_REVIEW: 'warning',
  RETURNED_TO_MANAGER: 'danger',
  APPROVED: 'success',
  REJECTED: 'danger',
  SIGNATURE_PENDING: 'info',
  SIGNED: 'success',
  COMPLETED: 'success',
  CANCELLED: 'neutral',
}

// Fase 5 — checklist de documentos do protótipo HTML (seção "5 — DOCUMENTOS E ANEXOS").
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  IMPOSTO_RENDA: 'Imposto de Renda',
  DOCUMENTACAO_PESSOAL: 'Documentação Pessoal do Cliente',
  COMPROVANTE_ENDERECO: 'Comprovante de Endereço',
  CONTRATO_SOCIAL: 'Contrato Social',
  CERTIDAO_ONUS_FAZENDA: 'Certidão de Ônus da Fazenda',
  CONTRATO_ARRENDAMENTO: 'Contrato de Arrendamento',
  DRE: 'DRE',
  CAR: 'CAR',
  DOCUMENTACAO_SOCIOS: 'Cópia da Documentação dos Sócios',
  AUTORIZACAO_SPC_BACEN: 'Termo de Autorização de Consulta SPC/Bacen',
  OUTROS: 'Outros Documentos / Anexos',
}

// Fase 6 — status da autorização de consulta SPC/Bacen via Clicksign (ver ADR-017).
export const SIGNATURE_STATUS_LABELS: Record<SignatureStatus, string> = {
  PENDING: 'Pendente',
  SENT: 'Enviada — aguardando assinatura do cliente',
  VIEWED: 'Visualizada pelo cliente',
  SIGNED: 'Assinada',
  DECLINED: 'Recusada pelo cliente',
  EXPIRED: 'Prazo expirado',
  CANCELLED: 'Cancelada',
}

export const SIGNATURE_STATUS_VARIANT: Record<
  SignatureStatus,
  StatusBadgeVariant
> = {
  PENDING: 'neutral',
  SENT: 'info',
  VIEWED: 'info',
  SIGNED: 'success',
  DECLINED: 'danger',
  EXPIRED: 'danger',
  CANCELLED: 'neutral',
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export function formatCurrency(value: string | number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value))
}
