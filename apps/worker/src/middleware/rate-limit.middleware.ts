import type { MiddlewareHandler } from 'hono';
import { tooManyRequests } from '../lib/errors.js';
import type { AppVariables, Env } from '../types/bindings.d.js';

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateLimitBucket>();

/**
 * Lightweight in-memory sliding-window rate limiter per isolate.
 * For production, complement with Cloudflare WAF Rate Limiting rules.
 */
export function rateLimit(options: {
  keyPrefix: string;
  maxRequests: number;
  windowMs: number;
}): MiddlewareHandler<{ Bindings: Env; Variables: AppVariables }> {
  return async (c, next) => {
    const clientIp = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'local';
    const key = `${options.keyPrefix}:${clientIp}`;
    const now = Date.now();
    const existing = buckets.get(key);

    if (!existing || existing.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    } else {
      existing.count += 1;
      if (existing.count > options.maxRequests) {
        throw tooManyRequests('Too many authentication attempts. Please wait and try again.');
      }
    }

    await next();
  };
}
