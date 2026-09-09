import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import type { AuthRequest } from '../types/auth-request.type.js';

/**
 * Registrado globalmente (ver AuthModule). Rotas sem @Roles(...) ficam
 * liberadas para qualquer usuario autenticado; rotas com @Roles(...) exigem
 * que o papel do usuario autenticado esteja na lista.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest<AuthRequest>();
    return Boolean(user) && requiredRoles.includes(user.role);
  }
}
