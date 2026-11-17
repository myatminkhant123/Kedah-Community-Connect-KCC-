import { Hono } from 'hono';
import {
  createReportNoteSchema,
  officerStatusUpdateSchema,
  reportFilterQuerySchema,
  resolveReportSchema,
} from '@kcc/shared';
import { notFound } from '../lib/errors.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/require-role.middleware.js';
import { DepartmentRepository } from '../repositories/department.repository.js';
import { NotificationRepository } from '../repositories/notification.repository.js';
import { ReportRepository } from '../repositories/report.repository.js';
import { ReportService } from '../services/report.service.js';
import { WorkflowService } from '../services/workflow.service.js';
import type { AppVariables, Env } from '../types/bindings.d.js';

export const departmentRoutes = new Hono<{ Bindings: Env; Variables: AppVariables }>();

departmentRoutes.use('*', authMiddleware, requireRole('OFFICER', 'ADMIN'));

departmentRoutes.get('/reports', async (c) => {
  const auth = c.get('auth')!;
  const query = reportFilterQuerySchema.parse(c.req.query());
  const service = new ReportService(
    new ReportRepository(c.env.DB),
    new DepartmentRepository(c.env.DB),
  );
  const { items, total } = await service.listReportsForUser(auth.user, query);
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

departmentRoutes.post('/reports/:reportId/status', async (c) => {
  const auth = c.get('auth')!;
  const reportId = c.req.param('reportId');
  const input = officerStatusUpdateSchema.parse(await c.req.json());

  const reportRepo = new ReportRepository(c.env.DB);
  const report = await reportRepo.findById(reportId);
  if (!report) throw notFound('Report not found');

  const workflow = new WorkflowService(reportRepo, new NotificationRepository(c.env.DB));
  const updated = await workflow.transition({
    report,
    actor: auth.user,
    toStatus: input.toStatus,
    comment: input.comment ?? 'Work started by department',
  });
  return c.json({ report: updated });
});

departmentRoutes.post('/reports/:reportId/notes', async (c) => {
  const auth = c.get('auth')!;
  const reportId = c.req.param('reportId');
  const input = createReportNoteSchema.parse(await c.req.json());

  const service = new ReportService(
    new ReportRepository(c.env.DB),
    new DepartmentRepository(c.env.DB),
  );
  const note = await service.addNote(auth.user, reportId, input);
  return c.json({ note }, 201);
});

departmentRoutes.post('/reports/:reportId/resolve', async (c) => {
  const auth = c.get('auth')!;
  const reportId = c.req.param('reportId');
  const input = resolveReportSchema.parse(await c.req.json());

  const reportRepo = new ReportRepository(c.env.DB);
  const report = await reportRepo.findById(reportId);
  if (!report) throw notFound('Report not found');

  const workflow = new WorkflowService(reportRepo, new NotificationRepository(c.env.DB));
  const updated = await workflow.transition({
    report,
    actor: auth.user,
    toStatus: 'RESOLVED',
    comment: input.summary,
  });
  return c.json({ report: updated });
});
