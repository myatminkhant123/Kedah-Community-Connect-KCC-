import type { MiddlewareHandler } from 'hono';
import type { UserRole } from '@kcc/shared';
import { forbidden, unauthorized } from '../lib/errors.js';
import type { AppVariables, Env } from '../types/bindings.d.js';

export function requireRole(
  ...allowedRoles: UserRole[]
): MiddlewareHandler<{ Bindings: Env; Variables: AppVariables }> {
  return async (c, next) => {
    const auth = c.get('auth');
    if (!auth) {
      throw unauthorized();
    }
    if (!allowedRoles.includes(auth.user.role)) {
      throw forbidden('Insufficient role permissions for this operation');
    }
    await next();
  };
}
