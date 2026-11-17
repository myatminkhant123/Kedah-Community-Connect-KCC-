import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { errorHandler } from './middleware/error.middleware.js';
import { requestIdMiddleware } from './middleware/request-id.middleware.js';
import { DepartmentRepository } from './repositories/department.repository.js';
import { adminRoutes } from './routes/admin.routes.js';
import { authRoutes } from './routes/auth.routes.js';
import { departmentRoutes } from './routes/department.routes.js';
import { notificationsRoutes } from './routes/notifications.routes.js';
import { reportsRoutes } from './routes/reports.routes.js';
import type { AppVariables, Env } from './types/bindings.d.js';

export function createApp() {
  const app = new Hono<{ Bindings: Env; Variables: AppVariables }>();

  app.use('*', requestIdMiddleware);
  app.use('/api/*', async (c, next) => {
    const configuredOrigin = c.env.CORS_ORIGIN;
    return cors({
      origin: (reqOrigin) => {
        if (!reqOrigin) return configuredOrigin || 'http://localhost:5173';
        if (configuredOrigin && reqOrigin === configuredOrigin) return reqOrigin;
        if (
          reqOrigin.includes('localhost') ||
          reqOrigin.endsWith('.vercel.app') ||
          reqOrigin.endsWith('.pages.dev')
        ) {
          return reqOrigin;
        }
        return configuredOrigin || reqOrigin;
      },
      credentials: true,
      allowHeaders: ['Content-Type', 'X-CSRF-Token', 'X-Request-Id'],
      allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    })(c, next);
  });

  app.onError(errorHandler);

  app.get('/', (c) => {
    return c.json({
      message: 'Kedah Community Connect API',
      health: '/api/v1/health',
      docs: '/api/v1',
    });
  });

  app.get('/favicon.ico', (c) => c.body(null, 204));

  const v1 = new Hono<{ Bindings: Env; Variables: AppVariables }>();

  v1.get('/health', (c) => {
    return c.json({
      status: 'ok',
      service: 'kedah-community-connect-api',
      environment: c.env.APP_ENV || 'development',
      timestamp: new Date().toISOString(),
    });
  });

  v1.get('/categories', async (c) => {
    const items = await new DepartmentRepository(c.env.DB).listCategories(true);
    return c.json({ items });
  });

  v1.get('/departments', async (c) => {
    const items = await new DepartmentRepository(c.env.DB).listDepartments(true);
    return c.json({ items });
  });

  v1.route('/auth', authRoutes);
  v1.route('/reports', reportsRoutes);
  v1.route('/admin', adminRoutes);
  v1.route('/department', departmentRoutes);
  v1.route('/notifications', notificationsRoutes);

  app.route('/api/v1', v1);

  return app;
}
