import { describe, expect, it } from 'vitest';
import { CreditRequestStatus, Role } from '@prisma/client';
import { podeEditarCadastro } from './workflow.types.js';

const { DRAFT, RETURNED_TO_CONSULTANT, SUBMITTED_TO_MANAGER, MANAGER_REVIEW, RETURNED_TO_MANAGER, SUBMITTED_TO_CREDIT, CREDIT_REVIEW, APPROVED } =
  CreditRequestStatus;

describe('podeEditarCadastro (matriz de edição)', () => {
  it('consultor dono edita em DRAFT e RETURNED_TO_CONSULTANT, e só nelas', () => {
    for (const status of [DRAFT, RETURNED_TO_CONSULTANT]) {
      expect(podeEditarCadastro({ status, role: Role.CONSULTOR, isOwner: true, mesmaFilial: true })).toBe(true);
    }
    for (const status of [SUBMITTED_TO_MANAGER, MANAGER_REVIEW, RETURNED_TO_MANAGER, SUBMITTED_TO_CREDIT, CREDIT_REVIEW, APPROVED]) {
      expect(podeEditarCadastro({ status, role: Role.CONSULTOR, isOwner: true, mesmaFilial: true })).toBe(false);
    }
  });

  it('consultor que não é dono não edita', () => {
    expect(podeEditarCadastro({ status: DRAFT, role: Role.CONSULTOR, isOwner: false, mesmaFilial: true })).toBe(false);
  });

  it('gerente da filial edita só na devolução do crédito (RETURNED_TO_MANAGER)', () => {
    expect(podeEditarCadastro({ status: RETURNED_TO_MANAGER, role: Role.GERENTE, isOwner: false, mesmaFilial: true })).toBe(true);
    expect(podeEditarCadastro({ status: MANAGER_REVIEW, role: Role.GERENTE, isOwner: false, mesmaFilial: true })).toBe(false);
    expect(podeEditarCadastro({ status: SUBMITTED_TO_MANAGER, role: Role.GERENTE, isOwner: false, mesmaFilial: true })).toBe(false);
  });

  it('gerente de outra filial não edita, mesmo na devolução', () => {
    expect(podeEditarCadastro({ status: RETURNED_TO_MANAGER, role: Role.GERENTE, isOwner: false, mesmaFilial: false })).toBe(false);
  });

  it('crédito não edita cadastro em nenhuma etapa', () => {
    for (const status of [SUBMITTED_TO_CREDIT, CREDIT_REVIEW, RETURNED_TO_MANAGER]) {
      expect(podeEditarCadastro({ status, role: Role.CREDITO, isOwner: false, mesmaFilial: true })).toBe(false);
    }
  });

  it('admin edita nas etapas de edição de consultor e de gerente', () => {
    expect(podeEditarCadastro({ status: DRAFT, role: Role.ADMIN, isOwner: false, mesmaFilial: false })).toBe(true);
    expect(podeEditarCadastro({ status: RETURNED_TO_MANAGER, role: Role.ADMIN, isOwner: false, mesmaFilial: false })).toBe(true);
    expect(podeEditarCadastro({ status: CREDIT_REVIEW, role: Role.ADMIN, isOwner: false, mesmaFilial: false })).toBe(false);
  });
});
