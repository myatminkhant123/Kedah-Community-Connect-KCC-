import type {
  CreateReportInput,
  CreateReportNoteInput,
  PublicUser,
  Report,
  ReportAttachment,
  ReportFilterQuery,
  ReportNote,
  ReportStatusHistoryItem,
  UpdateReportInput,
} from '@kcc/shared';
import { generateId, generateReferenceCode, nowIso } from '../lib/db.js';
import { badRequest, forbidden, notFound } from '../lib/errors.js';
import { DepartmentRepository } from '../repositories/department.repository.js';
import { ReportRepository } from '../repositories/report.repository.js';
import {
  canAddNote,
  canEditReportFields,
  canViewInternalNotes,
  canViewReport,
} from './policy.service.js';

export class ReportService {
  constructor(
    private readonly reportRepo: ReportRepository,
    private readonly departmentRepo: DepartmentRepository,
  ) {}

  async createReport(actor: PublicUser, input: CreateReportInput): Promise<Report> {
    if (actor.role !== 'RESIDENT' && actor.role !== 'ADMIN') {
      throw forbidden('Only residents or administrators can submit new reports');
    }

    const category = await this.departmentRepo.findCategoryById(input.categoryId);
    if (!category || !category.isActive) {
      throw badRequest('INVALID_CATEGORY', 'Selected category does not exist or is inactive');
    }

    const now = nowIso();
    const report: Report = {
      id: generateId('rep'),
      referenceCode: generateReferenceCode(),
      reporterId: actor.id,
      categoryId: category.id,
      categoryName: category.name,
      title: input.title,
      description: input.description,
      locationLabel: input.locationLabel ?? null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      status: 'SUBMITTED',
      priority: 'NORMAL',
      departmentId: null,
      departmentName: null,
      assignedOfficerId: null,
      assignedOfficerName: null,
      createdAt: now,
      updatedAt: now,
      resolvedAt: null,
    };

    await this.reportRepo.createWithInitialHistory({
      report,
      historyId: generateId('hist'),
    });

    return report;
  }

  async listReportsForUser(
    actor: PublicUser,
    filters: ReportFilterQuery,
  ): Promise<{ items: Report[]; total: number }> {
    if (actor.role === 'ADMIN') {
      return this.reportRepo.list(filters, {});
    }
    if (actor.role === 'OFFICER') {
      if (!actor.departmentId) {
        return { items: [], total: 0 };
      }
      return this.reportRepo.list(filters, {
        departmentId: actor.departmentId,
        officerId: actor.id,
      });
    }
    return this.reportRepo.list(filters, { reporterId: actor.id });
  }

  async getReportDetail(
    actor: PublicUser,
    reportId: string,
  ): Promise<{
    report: Report;
    history: ReportStatusHistoryItem[];
    notes: ReportNote[];
    attachments: ReportAttachment[];
  }> {
    const report = await this.reportRepo.findById(reportId);
    if (!report) {
      throw notFound('Report not found');
    }
    if (!canViewReport(actor, report)) {
      throw forbidden('You do not have access to this report');
    }

    const includeInternal = canViewInternalNotes(actor);
    const [history, notes, attachments] = await Promise.all([
      this.reportRepo.getStatusHistory(report.id),
      this.reportRepo.listNotes(report.id, includeInternal),
      this.reportRepo.listAttachments(report.id),
    ]);

    return { report, history, notes, attachments };
  }

  async updateReportFields(
    actor: PublicUser,
    reportId: string,
    input: UpdateReportInput,
  ): Promise<Report> {
    const report = await this.reportRepo.findById(reportId);
    if (!report) {
      throw notFound('Report not found');
    }
    if (!canEditReportFields(actor, report)) {
      throw forbidden('Report can only be edited by its owner while in SUBMITTED status');
    }

    if (input.categoryId) {
      const cat = await this.departmentRepo.findCategoryById(input.categoryId);
      if (!cat || !cat.isActive) {
        throw badRequest('INVALID_CATEGORY', 'Selected category does not exist or is inactive');
      }
    }

    await this.reportRepo.updateEditableFields(report.id, {
      ...input,
      updatedAt: nowIso(),
    });

    const updated = await this.reportRepo.findById(report.id);
    if (!updated) throw notFound('Report not found');
    return updated;
  }

  async addNote(
    actor: PublicUser,
    reportId: string,
    input: CreateReportNoteInput,
  ): Promise<ReportNote> {
    const report = await this.reportRepo.findById(reportId);
    if (!report) {
      throw notFound('Report not found');
    }
    if (!canAddNote(actor, report, input.visibility)) {
      throw forbidden('You do not have permission to add this note');
    }

    const note: ReportNote = {
      id: generateId('note'),
      reportId: report.id,
      authorId: actor.id,
      authorName: actor.displayName,
      body: input.body,
      visibility: input.visibility,
      createdAt: nowIso(),
    };
    await this.reportRepo.addNote(note);
    return note;
  }
}
