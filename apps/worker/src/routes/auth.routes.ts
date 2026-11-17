import { Hono } from 'hono';
import { deleteCookie, setCookie } from 'hono/cookie';
import { loginSchema, registerSchema } from '@kcc/shared';
import { authMiddleware, SESSION_COOKIE_NAME } from '../middleware/auth.middleware.js';
import { rateLimit } from '../middleware/rate-limit.middleware.js';
import { UserRepository } from '../repositories/user.repository.js';
import { AuthService } from '../services/auth.service.js';
import type { AppVariables, Env } from '../types/bindings.d.js';

export const authRoutes = new Hono<{ Bindings: Env; Variables: AppVariables }>();

function setSessionCookie(
  c: Parameters<typeof setCookie>[0],
  token: string,
  expiresAt: string,
  isProd: boolean,
): void {
  setCookie(c, SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'Lax',
    secure: isProd,
    path: '/',
    expires: new Date(expiresAt),
  });
}

authRoutes.post(
  '/register',
  rateLimit({ keyPrefix: 'register', maxRequests: 10, windowMs: 15 * 60 * 1000 }),
  async (c) => {
    const body = await c.req.json();
    const input = registerSchema.parse(body);
    const authService = new AuthService(new UserRepository(c.env.DB));
    const result = await authService.register(input);

    setSessionCookie(c, result.sessionToken, result.expiresAt, c.env.APP_ENV === 'production');

    return c.json({ user: result.user, csrfToken: result.csrfToken }, 201);
  },
);

authRoutes.post(
  '/login',
  rateLimit({ keyPrefix: 'login', maxRequests: 15, windowMs: 15 * 60 * 1000 }),
  async (c) => {
    const body = await c.req.json();
    const input = loginSchema.parse(body);
    const authService = new AuthService(new UserRepository(c.env.DB));
    const result = await authService.login(input);

    setSessionCookie(c, result.sessionToken, result.expiresAt, c.env.APP_ENV === 'production');

    return c.json({ user: result.user, csrfToken: result.csrfToken });
  },
);

authRoutes.post('/logout', authMiddleware, async (c) => {
  const auth = c.get('auth')!;
  const authService = new AuthService(new UserRepository(c.env.DB));
  await authService.logout(auth.sessionId);

  deleteCookie(c, SESSION_COOKIE_NAME, { path: '/' });
  return c.json({ ok: true });
});

authRoutes.get('/me', authMiddleware, (c) => {
  const auth = c.get('auth')!;
  return c.json({ user: auth.user, csrfToken: auth.csrfToken });
});
