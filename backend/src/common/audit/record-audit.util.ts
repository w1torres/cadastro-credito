import type { AuditLog, Prisma } from '@prisma/client';

export interface RecordAuditData {
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  metadata?: Prisma.InputJsonValue;
}

/**
 * Grava uma linha de auditoria (spec 06) dentro de uma transação Prisma já
 * aberta pelo chamador — nunca abre a própria transação, para que status,
 * histórico e auditoria fiquem atômicos (spec 04: "status + history + audit
 * deve ocorrer em transação").
 */
export function recordAudit(
  tx: Prisma.TransactionClient,
  data: RecordAuditData,
): Promise<AuditLog> {
  return tx.auditLog.create({ data });
}
