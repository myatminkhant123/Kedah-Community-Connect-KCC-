import type { ErrorHandler } from 'hono';
import { ZodError } from 'zod';
import { AppError } from '../lib/errors.js';
import type { AppVariables, Env } from '../types/bindings.d.js';

export const errorHandler: ErrorHandler<{
  Bindings: Env;
  Variables: AppVariables;
}> = (err, c) => {
  const requestId = c.get('requestId') || crypto.randomUUID();

  if (err instanceof AppError) {
    return c.json(
      {
        error: {
          code: err.code,
          message: err.message,
          requestId,
          ...(err.details !== undefined ? { details: err.details } : {}),
        },
      },
      err.status as 400 | 401 | 403 | 404 | 409 | 429 | 500,
    );
  }

  if (err instanceof ZodError) {
    return c.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          requestId,
          details: err.flatten(),
        },
      },
      400,
    );
  }

  console.error(
    JSON.stringify({
      level: 'error',
      requestId,
      name: err instanceof Error ? err.name : 'UnknownError',
      message: err instanceof Error ? err.message : 'Unexpected error',
    }),
  );

  return c.json(
    {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        requestId,
      },
    },
    500,
  );
};
