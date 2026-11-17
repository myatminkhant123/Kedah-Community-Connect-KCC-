import type { MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';
import { sha256Hex } from '../lib/crypto.js';
import { forbidden, unauthorized } from '../lib/errors.js';
import { UserRepository } from '../repositories/user.repository.js';
import type { AppVariables, Env } from '../types/bindings.d.js';

export const SESSION_COOKIE_NAME = 'kcc_session';
const MUTATING_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

export const authMiddleware: MiddlewareHandler<{
  Bindings: Env;
  Variables: AppVariables;
}> = async (c, next) => {
  const rawToken = getCookie(c, SESSION_COOKIE_NAME);
  if (!rawToken) {
    throw unauthorized('Authentication required');
  }

  const tokenHash = await sha256Hex(rawToken);
  const userRepo = new UserRepository(c.env.DB);
  const sessionRecord = await userRepo.findActiveSessionByTokenHash(tokenHash);

  if (!sessionRecord) {
    throw unauthorized('Session is invalid or has expired');
  }

  if (!sessionRecord.user.isActive) {
    throw forbidden('Account is deactivated');
  }

  if (MUTATING_METHODS.has(c.req.method)) {
    const csrfHeader = c.req.header('x-csrf-token');
    if (!csrfHeader || csrfHeader !== sessionRecord.csrfToken) {
      throw forbidden('Invalid or missing CSRF token');
    }
  }

  c.set('auth', {
    user: sessionRecord.user,
    sessionId: sessionRecord.sessionId,
    csrfToken: sessionRecord.csrfToken,
  });

  await next();
};
