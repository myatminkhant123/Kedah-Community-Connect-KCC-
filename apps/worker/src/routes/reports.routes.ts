import { Hono } from 'hono';
import {
  cancelReportSchema,
  createReportSchema,
  reportFilterQuerySchema,
  updateReportSchema,
} from '@kcc/shared';
import { badRequest, notFound } from '../lib/errors.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { DepartmentRepository } from '../repositories/department.repository.js';
import { NotificationRepository } from '../repositories/notification.repository.js';
import { ReportRepository } from '../repositories/report.repository.js';
import { AttachmentService } from '../services/attachment.service.js';
import { ReportService } from '../services/report.service.js';
import { WorkflowService } from '../services/workflow.service.js';
import { R2StorageAdapter } from '../storage/r2.storage.js';
import type { AppVariables, Env } from '../types/bindings.d.js';

export const reportsRoutes = new Hono<{ Bindings: Env; Variables: AppVariables }>();

reportsRoutes.use('*', authMiddleware);

reportsRoutes.post('/', async (c) => {
  const auth = c.get('auth')!;
  const input = createReportSchema.parse(await c.req.json());
  const service = new ReportService(
    new ReportRepository(c.env.DB),
    new DepartmentRepository(c.env.DB),
  );
  const report = await service.createReport(auth.user, input);
  return c.json({ report }, 201);
});

reportsRoutes.get('/', async (c) => {
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

reportsRoutes.get('/:reportId', async (c) => {
  const auth = c.get('auth')!;
  const reportId = c.req.param('reportId');
  const service = new ReportService(
    new ReportRepository(c.env.DB),
    new DepartmentRepository(c.env.DB),
  );
  const detail = await service.getReportDetail(auth.user, reportId);
  return c.json(detail);
});

reportsRoutes.patch('/:reportId', async (c) => {
  const auth = c.get('auth')!;
  const reportId = c.req.param('reportId');
  const input = updateReportSchema.parse(await c.req.json());
  const service = new ReportService(
    new ReportRepository(c.env.DB),
    new DepartmentRepository(c.env.DB),
  );
  const report = await service.updateReportFields(auth.user, reportId, input);
  return c.json({ report });
});

reportsRoutes.post('/:reportId/cancel', async (c) => {
  const auth = c.get('auth')!;
  const reportId = c.req.param('reportId');
  const rawBody = await c.req.text();
  const input = cancelReportSchema.parse(rawBody ? JSON.parse(rawBody) : {});

  const reportRepo = new ReportRepository(c.env.DB);
  const report = await reportRepo.findById(reportId);
  if (!report) throw notFound('Report not found');

  const workflow = new WorkflowService(reportRepo, new NotificationRepository(c.env.DB));
  const updated = await workflow.transition({
    report,
    actor: auth.user,
    toStatus: 'CANCELLED',
    comment: input.reason ?? 'Cancelled by reporter',
  });
  return c.json({ report: updated });
});

reportsRoutes.get('/:reportId/history', async (c) => {
  const auth = c.get('auth')!;
  const reportId = c.req.param('reportId');
  const service = new ReportService(
    new ReportRepository(c.env.DB),
    new DepartmentRepository(c.env.DB),
  );
  const detail = await service.getReportDetail(auth.user, reportId);
  return c.json({ items: detail.history });
});

reportsRoutes.post('/:reportId/attachments', async (c) => {
  if (!c.env.REPORT_FILES) {
    throw badRequest('STORAGE_UNAVAILABLE', 'File attachment storage is not enabled on this deployment');
  }
  const auth = c.get('auth')!;
  const reportId = c.req.param('reportId');
  const formData = await c.req.formData();
  const file = formData.get('file');

  if (!file || !(file instanceof File)) {
    throw badRequest('MISSING_FILE', 'Multipart form field "file" is required');
  }

  const attachmentService = new AttachmentService(
    new ReportRepository(c.env.DB),
    new R2StorageAdapter(c.env.REPORT_FILES),
  );

  const attachment = await attachmentService.uploadAttachment({
    actor: auth.user,
    reportId,
    originalFilename: file.name || 'upload.bin',
    declaredMimeType: file.type,
    fileBuffer: await file.arrayBuffer(),
  });

  return c.json({ attachment }, 201);
});

reportsRoutes.get('/:reportId/attachments', async (c) => {
  const auth = c.get('auth')!;
  const reportId = c.req.param('reportId');
  const service = new ReportService(
    new ReportRepository(c.env.DB),
    new DepartmentRepository(c.env.DB),
  );
  const detail = await service.getReportDetail(auth.user, reportId);
  return c.json({ items: detail.attachments });
});

reportsRoutes.get('/:reportId/attachments/:attachmentId', async (c) => {
  if (!c.env.REPORT_FILES) {
    throw badRequest('STORAGE_UNAVAILABLE', 'File attachment storage is not enabled on this deployment');
  }
  const auth = c.get('auth')!;
  const { reportId, attachmentId } = c.req.param();
  const attachmentService = new AttachmentService(
    new ReportRepository(c.env.DB),
    new R2StorageAdapter(c.env.REPORT_FILES),
  );
  const obj = await attachmentService.downloadAttachment(auth.user, reportId, attachmentId);

  return new Response(obj.body, {
    headers: {
      'Content-Type': obj.contentType,
      'Content-Disposition': `inline; filename="${obj.originalFilename.replace(/"/g, '')}"`,
      'Cache-Control': 'private, max-age=300',
    },
  });
});
