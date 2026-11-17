import type { PublicUser, Report, ReportPriority, ReportStatus } from '@kcc/shared';
import { generateId, nowIso } from '../lib/db.js';
import { badRequest, conflict, forbidden } from '../lib/errors.js';
import { NotificationRepository } from '../repositories/notification.repository.js';
import { ReportRepository } from '../repositories/report.repository.js';
import { canViewReport } from './policy.service.js';

interface TransitionRule {
  from: ReportStatus;
  to: ReportStatus;
  allowedRoles: Array<'RESIDENT' | 'ADMIN' | 'OFFICER'>;
  requiresComment?: boolean;
  requiresDepartment?: boolean;
  auditAction?: string;
}

const TRANSITION_RULES: TransitionRule[] = [
  {
    from: 'SUBMITTED',
    to: 'UNDER_REVIEW',
    allowedRoles: ['ADMIN'],
    auditAction: 'REPORT_REVIEW_STARTED',
  },
  {
    from: 'UNDER_REVIEW',
    to: 'ASSIGNED',
    allowedRoles: ['ADMIN'],
    requiresDepartment: true,
    auditAction: 'REPORT_ASSIGNED',
  },
  {
    from: 'REOPENED',
    to: 'ASSIGNED',
    allowedRoles: ['ADMIN'],
    requiresDepartment: true,
    auditAction: 'REPORT_REASSIGNED',
  },
  {
    from: 'UNDER_REVIEW',
    to: 'REJECTED',
    allowedRoles: ['ADMIN'],
    requiresComment: true,
    auditAction: 'REPORT_REJECTED',
  },
  {
    from: 'ASSIGNED',
    to: 'IN_PROGRESS',
    allowedRoles: ['OFFICER', 'ADMIN'],
  },
  {
    from: 'IN_PROGRESS',
    to: 'RESOLVED',
    allowedRoles: ['OFFICER', 'ADMIN'],
    requiresComment: true,
    auditAction: 'REPORT_RESOLVED',
  },
  {
    from: 'IN_PROGRESS',
    to: 'REOPENED',
    allowedRoles: ['ADMIN'],
    requiresComment: true,
    auditAction: 'REPORT_REOPENED',
  },
  {
    from: 'RESOLVED',
    to: 'REOPENED',
    allowedRoles: ['ADMIN'],
    requiresComment: true,
    auditAction: 'REPORT_REOPENED',
  },
  {
    from: 'SUBMITTED',
    to: 'CANCELLED',
    allowedRoles: ['RESIDENT', 'ADMIN'],
    auditAction: 'REPORT_CANCELLED',
  },
];

export function isTransitionAllowed(from: ReportStatus, to: ReportStatus): TransitionRule | null {
  return TRANSITION_RULES.find((r) => r.from === from && r.to === to) ?? null;
}

export class WorkflowService {
  constructor(
    private readonly reportRepo: ReportRepository,
    private readonly notificationRepo: NotificationRepository,
  ) {}

  async transition(params: {
    report: Report;
    actor: PublicUser;
    toStatus: ReportStatus;
    comment?: string | null;
    departmentId?: string | null;
    assignedOfficerId?: string | null;
    priority?: ReportPriority;
  }): Promise<Report> {
    const { report, actor, toStatus } = params;
    const rule = isTransitionAllowed(report.status, toStatus);

    if (!rule) {
      throw conflict(
        'INVALID_STATUS_TRANSITION',
        `Transition from ${report.status} to ${toStatus} is not permitted`,
      );
    }

    if (!rule.allowedRoles.includes(actor.role)) {
      throw forbidden(`Role ${actor.role} cannot transition report to ${toStatus}`);
    }

    if (actor.role === 'RESIDENT' && report.reporterId !== actor.id) {
      throw forbidden('Residents can only cancel their own reports');
    }

    if (actor.role === 'OFFICER' && !canViewReport(actor, report)) {
      throw forbidden('Officers can only update reports assigned to their department or account');
    }

    const trimmedComment = params.comment?.trim() || null;
    if (rule.requiresComment && !trimmedComment) {
      throw badRequest(
        'COMMENT_REQUIRED',
        `A reason or summary is required when transitioning to ${toStatus}`,
      );
    }

    if (rule.requiresDepartment && !params.departmentId) {
      throw badRequest('DEPARTMENT_REQUIRED', 'A target department is required for assignment');
    }

    const now = nowIso();
    const resolvedAt = toStatus === 'RESOLVED' ? now : null;

    await this.reportRepo.transitionStatusAtomic({
      reportId: report.id,
      fromStatus: report.status,
      toStatus,
      actorId: actor.id,
      comment: trimmedComment,
      departmentId: params.departmentId ?? null,
      assignedOfficerId: params.assignedOfficerId ?? null,
      priority: params.priority,
      resolvedAt,
      now,
      historyId: generateId('hist'),
      auditId: rule.auditAction ? generateId('aud') : undefined,
      auditAction: rule.auditAction,
      auditMetadataJson: rule.auditAction
        ? JSON.stringify({
            fromStatus: report.status,
            toStatus,
            departmentId: params.departmentId ?? report.departmentId,
          })
        : undefined,
    });

    if (actor.id !== report.reporterId) {
      try {
        await this.notificationRepo.create({
          id: generateId('notif'),
          userId: report.reporterId,
          reportId: report.id,
          title: `Report ${report.referenceCode} updated`,
          body: `Status changed from ${report.status} to ${toStatus}.`,
          readAt: null,
          createdAt: now,
        });
      } catch (err) {
        console.warn(
          JSON.stringify({
            level: 'warn',
            message: 'Failed to create in-app notification',
            reportId: report.id,
            error: err instanceof Error ? err.message : 'Unknown',
          }),
        );
      }
    }

    const updated = await this.reportRepo.findById(report.id);
    if (!updated) {
      throw new Error('Report disappeared after status transition');
    }
    return updated;
  }
}
