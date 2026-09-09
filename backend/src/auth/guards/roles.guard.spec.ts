import type { ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard.js';

function createContext(user: unknown): ExecutionContext {
  return {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

function createReflector(roles: string[] | undefined): Reflector {
  return { getAllAndOverride: () => roles } as unknown as Reflector;
}

describe('RolesGuard', () => {
  it('allows the request when the route requires no roles', () => {
    const guard = new RolesGuard(createReflector(undefined));
    expect(guard.canActivate(createContext({ role: 'CONSULTOR' }))).toBe(true);
  });

  it('allows the request when the user role matches one of the required roles', () => {
    const guard = new RolesGuard(createReflector(['ADMIN', 'GERENTE']));
    expect(guard.canActivate(createContext({ role: 'ADMIN' }))).toBe(true);
  });

  it('denies the request when the user role does not match', () => {
    const guard = new RolesGuard(createReflector(['ADMIN']));
    expect(guard.canActivate(createContext({ role: 'CONSULTOR' }))).toBe(false);
  });

  it('denies the request when there is no authenticated user', () => {
    const guard = new RolesGuard(createReflector(['ADMIN']));
    expect(guard.canActivate(createContext(undefined))).toBe(false);
  });
});
