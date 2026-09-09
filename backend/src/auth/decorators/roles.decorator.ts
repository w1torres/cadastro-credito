import { SetMetadata } from '@nestjs/common';
import type { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

/** Restringe uma rota aos papeis informados. Aplicado pelo RolesGuard global. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
