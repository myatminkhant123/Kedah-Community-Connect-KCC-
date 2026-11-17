import { Hono } from 'hono';
import {
  assignReportSchema,
  createCategorySchema,
  createDepartmentSchema,
  paginationQuerySchema,
  rejectReportSchema,
  reopenReportSchema,
  reviewReportSchema,
  updateCategorySchema,
  updateDepartmentSchema,
  updateUserRoleSchema,
} from '@kcc/shared';
import { generateId } from '../lib/db.js';
import { badRequest, notFound } from '../lib/errors.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/require-role.middleware.js';
import { AuditRepository } from '../repositories/audit.repository.js';
import { DepartmentRepository } from '../repositories/department.repository.js';
import { NotificationRepository } from '../repositories/notification.repository.js';
import { ReportRepository } from '../repositories/report.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import { WorkflowService } from '../services/workflow.service.js';
import type { AppVariables, Env } from '../types/bindings.d.js';

export const adminRoutes = new Hono<{ Bindings: Env; Variables: AppVariables }>();

adminRoutes.use('*', authMiddleware, requireRole('ADMIN'));

adminRoutes.post('/reports/:reportId/review', async (c) => {
  const auth = c.get('auth')!;
  const reportId = c.req.param('reportId');
  const rawBody = await c.req.text();
  const input = reviewReportSchema.parse(rawBody ? JSON.parse(rawBody) : {});

  const reportRepo = new ReportRepository(c.env.DB);
  const report = await reportRepo.findById(reportId);
  if (!report) throw notFound('Report not found');

  const workflow = new WorkflowService(reportRepo, new NotificationRepository(c.env.DB));
  const updated = await workflow.transition({
    report,
    actor: auth.user,
    toStatus: 'UNDER_REVIEW',
    comment: input.comment ?? 'Report moved to review',
  });
  return c.json({ report: updated });
});

adminRoutes.post('/reports/:reportId/reject', async (c) => {
  const auth = c.get('auth')!;
  const reportId = c.req.param('reportId');
  const input = rejectReportSchema.parse(await c.req.json());

  const reportRepo = new ReportRepository(c.env.DB);
  const report = await reportRepo.findById(reportId);
  if (!report) throw notFound('Report not found');

  const workflow = new WorkflowService(reportRepo, new NotificationRepository(c.env.DB));
  const updated = await workflow.transition({
    report,
    actor: auth.user,
    toStatus: 'REJECTED',
    comment: input.reason,
  });
  return c.json({ report: updated });
});

adminRoutes.post('/reports/:reportId/assign', async (c) => {
  const auth = c.get('auth')!;
  const reportId = c.req.param('reportId');
  const input = assignReportSchema.parse(await c.req.json());

  const deptRepo = new DepartmentRepository(c.env.DB);
  const dept = await deptRepo.findDepartmentById(input.departmentId);
  if (!dept || !dept.isActive) {
    throw badRequest('INVALID_DEPARTMENT', 'Target department does not exist or is inactive');
  }

  if (input.assignedOfficerId) {
    const userRepo = new UserRepository(c.env.DB);
    const officer = await userRepo.findPublicById(input.assignedOfficerId);
    if (!officer || officer.role !== 'OFFICER' || officer.departmentId !== dept.id) {
      throw badRequest(
        'INVALID_OFFICER',
        'Assigned officer must be an active OFFICER belonging to the target department',
      );
    }
  }

  const reportRepo = new ReportRepository(c.env.DB);
  const report = await reportRepo.findById(reportId);
  if (!report) throw notFound('Report not found');

  const workflow = new WorkflowService(reportRepo, new NotificationRepository(c.env.DB));
  const updated = await workflow.transition({
    report,
    actor: auth.user,
    toStatus: 'ASSIGNED',
    departmentId: dept.id,
    assignedOfficerId: input.assignedOfficerId ?? null,
    priority: input.priority,
    comment: input.comment ?? `Assigned to ${dept.name}`,
  });
  return c.json({ report: updated });
});

adminRoutes.post('/reports/:reportId/reopen', async (c) => {
  const auth = c.get('auth')!;
  const reportId = c.req.param('reportId');
  const input = reopenReportSchema.parse(await c.req.json());

  const reportRepo = new ReportRepository(c.env.DB);
  const report = await reportRepo.findById(reportId);
  if (!report) throw notFound('Report not found');

  const workflow = new WorkflowService(reportRepo, new NotificationRepository(c.env.DB));
  const updated = await workflow.transition({
    report,
    actor: auth.user,
    toStatus: 'REOPENED',
    comment: input.reason,
  });
  return c.json({ report: updated });
});

adminRoutes.get('/analytics/summary', async (c) => {
  const reportRepo = new ReportRepository(c.env.DB);
  const summary = await reportRepo.getAnalyticsSummary();
  return c.json({ summary });
});

adminRoutes.get('/users', async (c) => {
  const query = paginationQuerySchema.parse(c.req.query());
  const userRepo = new UserRepository(c.env.DB);
  const { items, total } = await userRepo.listUsers(query.limit, query.offset);
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

adminRoutes.patch('/users/:userId/role', async (c) => {
  const auth = c.get('auth')!;
  const userId = c.req.param('userId');
  const input = updateUserRoleSchema.parse(await c.req.json());

  const userRepo = new UserRepository(c.env.DB);
  const target = await userRepo.findPublicById(userId);
  if (!target) throw notFound('User not found');

  if (input.departmentId) {
    const dept = await new DepartmentRepository(c.env.DB).findDepartmentById(input.departmentId);
    if (!dept) throw badRequest('INVALID_DEPARTMENT', 'Target department does not exist');
  }

  const updated = await userRepo.updateUserRole(
    userId,
    input.role,
    input.role === 'OFFICER' ? (input.departmentId ?? null) : null,
  );

  await new AuditRepository(c.env.DB).record({
    id: generateId('aud'),
    actorId: auth.user.id,
    action: 'USER_ROLE_UPDATED',
    entityType: 'USER',
    entityId: userId,
    metadata: {
      previousRole: target.role,
      newRole: input.role,
      departmentId: input.departmentId ?? null,
    },
  });

  return c.json({ user: updated });
});

adminRoutes.get('/categories', async (c) => {
  const items = await new DepartmentRepository(c.env.DB).listCategories(false);
  return c.json({ items });
});

adminRoutes.post('/categories', async (c) => {
  const input = createCategorySchema.parse(await c.req.json());
  const category = await new DepartmentRepository(c.env.DB).createCategory({
    id: generateId('cat'),
    name: input.name,
    description: input.description ?? null,
  });
  return c.json({ category }, 201);
});

adminRoutes.patch('/categories/:categoryId', async (c) => {
  const categoryId = c.req.param('categoryId');
  const input = updateCategorySchema.parse(await c.req.json());
  const category = await new DepartmentRepository(c.env.DB).updateCategory(categoryId, input);
  if (!category) throw notFound('Category not found');
  return c.json({ category });
});

adminRoutes.get('/departments', async (c) => {
  const items = await new DepartmentRepository(c.env.DB).listDepartments(false);
  return c.json({ items });
});

adminRoutes.post('/departments', async (c) => {
  const input = createDepartmentSchema.parse(await c.req.json());
  const department = await new DepartmentRepository(c.env.DB).createDepartment({
    id: generateId('dept'),
    name: input.name,
    description: input.description ?? null,
  });
  return c.json({ department }, 201);
});

adminRoutes.patch('/departments/:departmentId', async (c) => {
  const departmentId = c.req.param('departmentId');
  const input = updateDepartmentSchema.parse(await c.req.json());
  const department = await new DepartmentRepository(c.env.DB).updateDepartment(departmentId, input);
  if (!department) throw notFound('Department not found');
  return c.json({ department });
});
