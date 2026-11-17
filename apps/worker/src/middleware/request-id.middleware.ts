import type { MiddlewareHandler } from 'hono';
import type { AppVariables, Env } from '../types/bindings.d.js';

export const requestIdMiddleware: MiddlewareHandler<{
  Bindings: Env;
  Variables: AppVariables;
}> = async (c, next) => {
  const requestId = c.req.header('x-request-id') || crypto.randomUUID();
  c.set('requestId', requestId);
  const start = Date.now();

  await next();

  c.header('X-Request-Id', requestId);
  const durationMs = Date.now() - start;

  // Structured log without sensitive headers, cookies, or body payloads
  console.log(
    JSON.stringify({
      level: 'info',
      requestId,
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      durationMs,
    }),
  );
};
