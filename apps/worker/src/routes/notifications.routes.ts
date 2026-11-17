import { Hono } from 'hono';
import { paginationQuerySchema } from '@kcc/shared';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { NotificationRepository } from '../repositories/notification.repository.js';
import { NotificationService } from '../services/notification.service.js';
import type { AppVariables, Env } from '../types/bindings.d.js';

export const notificationsRoutes = new Hono<{ Bindings: Env; Variables: AppVariables }>();

notificationsRoutes.use('*', authMiddleware);

notificationsRoutes.get('/', async (c) => {
  const auth = c.get('auth')!;
  const query = paginationQuerySchema.parse(c.req.query());
  const service = new NotificationService(new NotificationRepository(c.env.DB));
  const { items, total } = await service.listForUser(auth.user, query.limit, query.offset);

  return c.json({
    items,
    pagination: {
      limit: query.limit,
      offset: query.offset,
      total,
      hasMore: query.offset + items.length < total,
    },
  });
});

notificationsRoutes.post('/:notificationId/read', async (c) => {
  const auth = c.get('auth')!;
  const notificationId = c.req.param('notificationId');
  const service = new NotificationService(new NotificationRepository(c.env.DB));
  await service.markAsRead(auth.user, notificationId);
  return c.json({ ok: true });
});
