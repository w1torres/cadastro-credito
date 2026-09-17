import type { Role } from '@prisma/client';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** Filial do usuário (CONSULTOR/GERENTE). `null` para CREDITO/ADMIN, que não têm recorte por filial. */
  branchId: string | null;
}
