import type { Role } from '../types/role'
import type { TimeInBusiness } from '../types/time-in-business'
import type { CreditRequestStatus } from '../types/credit-request-status'

export const ROLE_LABELS: Record<Role, string> = {
  CONSULTOR: 'Consultor',
  GERENTE: 'Gerente',
  CREDITO: 'Crédito',
  ADMIN: 'Administrador',
}

export const TIME_IN_BUSINESS_LABELS: Record<TimeInBusiness, string> = {
  MORE_THAN_10_YEARS: 'Mais de 10 anos',
  FROM_5_TO_10_YEARS: 'De 5 a 10 anos',
  FROM_3_TO_5_YEARS: 'De 3 a 5 anos',
  LESS_THAN_3_YEARS: 'Menos de 3 anos',
}

export const CREDIT_REQUEST_STATUS_LABELS: Record<CreditRequestStatus, string> = {
  DRAFT: 'Rascunho',
  SUBMITTED_TO_MANAGER: 'Enviado ao gerente',
  MANAGER_REVIEW: 'Em análise (gerente)',
  RETURNED_TO_CONSULTANT: 'Devolvido ao consultor',
  SUBMITTED_TO_CREDIT: 'Enviado ao crédito',
  CREDIT_REVIEW: 'Em análise (crédito)',
  RETURNED_TO_MANAGER: 'Devolvido ao gerente',
  APPROVED: 'Aprovado',
  REJECTED: 'Reprovado',
  SIGNATURE_PENDING: 'Aguardando assinatura',
  SIGNED: 'Assinado',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
}

export type StatusBadgeVariant = 'neutral' | 'info' | 'warning' | 'success' | 'danger'

export const CREDIT_REQUEST_STATUS_VARIANT: Record<CreditRequestStatus, StatusBadgeVariant> = {
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

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export function formatCurrency(value: string | number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))
}
