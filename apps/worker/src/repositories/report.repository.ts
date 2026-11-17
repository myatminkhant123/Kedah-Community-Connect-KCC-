import type {
  AnalyticsSummary,
  NoteVisibility,
  Report,
  ReportAttachment,
  ReportFilterQuery,
  ReportNote,
  ReportPriority,
  ReportStatus,
  ReportStatusHistoryItem,
} from '@kcc/shared';
import { REPORT_STATUSES } from '@kcc/shared';

interface ReportRow {
  id: string;
  reference_code: string;
  reporter_id: string;
  category_id: string;
  category_name?: string;
  title: string;
  description: string;
  location_label: string | null;
  latitude: number | null;
  longitude: number | null;
  status: ReportStatus;
  priority: ReportPriority;
  department_id: string | null;
  department_name?: string | null;
  assigned_officer_id: string | null;
  assigned_officer_name?: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

function mapReport(row: ReportRow): Report {
  return {
    id: row.id,
    referenceCode: row.reference_code,
    reporterId: row.reporter_id,
    categoryId: row.category_id,
    categoryName: row.category_name,
    title: row.title,
    description: row.description,
    locationLabel: row.location_label,
    latitude: row.latitude,
    longitude: row.longitude,
    status: row.status,
    priority: row.priority,
    departmentId: row.department_id,
    departmentName: row.department_name ?? null,
    assignedOfficerId: row.assigned_officer_id,
    assignedOfficerName: row.assigned_officer_name ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    resolvedAt: row.resolved_at,
  };
}

export class ReportRepository {
  constructor(private readonly db: D1Database) {}

  async findById(reportId: string): Promise<Report | null> {
    const row = await this.db
      .prepare(
        `SELECT r.*, c.name AS category_name, d.name AS department_name, u.display_name AS assigned_officer_name
         FROM reports r
         LEFT JOIN categories c ON c.id = r.category_id
         LEFT JOIN departments d ON d.id = r.department_id
         LEFT JOIN users u ON u.id = r.assigned_officer_id
         WHERE r.id = ? LIMIT 1`,
      )
      .bind(reportId)
      .first<ReportRow>();
    return row ? mapReport(row) : null;
  }

  async list(
    filters: ReportFilterQuery,
    scope: { reporterId?: string; departmentId?: string; officerId?: string },
  ): Promise<{ items: Report[]; total: number }> {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (scope.reporterId) {
      conditions.push('r.reporter_id = ?');
      params.push(scope.reporterId);
    }
    if (scope.departmentId) {
      conditions.push('(r.department_id = ? OR r.assigned_officer_id = ?)');
      params.push(scope.departmentId, scope.officerId ?? '');
    }
    if (filters.status) {
      conditions.push('r.status = ?');
      params.push(filters.status);
    }
    if (filters.categoryId) {
      conditions.push('r.category_id = ?');
      params.push(filters.categoryId);
    }
    if (filters.priority) {
      conditions.push('r.priority = ?');
      params.push(filters.priority);
    }
    if (filters.fromDate) {
      conditions.push('r.created_at >= ?');
      params.push(filters.fromDate);
    }
    if (filters.toDate) {
      conditions.push('r.created_at <= ?');
      params.push(filters.toDate);
    }
    if (filters.search) {
      conditions.push('(r.title LIKE ? OR r.reference_code LIKE ? OR r.location_label LIKE ?)');
      const like = `%${filters.search}%`;
      params.push(like, like, like);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRow = await this.db
      .prepare(`SELECT COUNT(*) AS total FROM reports r ${whereClause}`)
      .bind(...params)
      .first<{ total: number }>();

    const { results } = await this.db
      .prepare(
        `SELECT r.*, c.name AS category_name, d.name AS department_name, u.display_name AS assigned_officer_name
         FROM reports r
         LEFT JOIN categories c ON c.id = r.category_id
         LEFT JOIN departments d ON d.id = r.department_id
         LEFT JOIN users u ON u.id = r.assigned_officer_id
         ${whereClause}
         ORDER BY r.created_at DESC
         LIMIT ? OFFSET ?`,
      )
      .bind(...params, filters.limit, filters.offset)
      .all<ReportRow>();

    return {
      items: results.map(mapReport),
      total: Number(countRow?.total ?? 0),
    };
  }

  async createWithInitialHistory(params: { report: Report; historyId: string }): Promise<void> {
    const r = params.report;
    await this.db.batch([
      this.db
        .prepare(
          `INSERT INTO reports (
            id, reference_code, reporter_id, category_id, title, description,
            location_label, latitude, longitude, status, priority,
            department_id, assigned_officer_id, created_at, updated_at, resolved_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, ?, NULL)`,
        )
        .bind(
          r.id,
          r.referenceCode,
          r.reporterId,
          r.categoryId,
          r.title,
          r.description,
          r.locationLabel,
          r.latitude,
          r.longitude,
          r.status,
          r.priority,
          r.createdAt,
          r.updatedAt,
        ),
      this.db
        .prepare(
          `INSERT INTO report_status_history (id, report_id, actor_id, from_status, to_status, comment, created_at)
           VALUES (?, ?, ?, NULL, ?, 'Report submitted', ?)`,
        )
        .bind(params.historyId, r.id, r.reporterId, r.status, r.createdAt),
    ]);
  }

  async updateEditableFields(
    reportId: string,
    fields: {
      categoryId?: string;
      title?: string;
      description?: string;
      locationLabel?: string | null;
      latitude?: number | null;
      longitude?: number | null;
      updatedAt: string;
    },
  ): Promise<void> {
    const sets: string[] = [];
    const params: unknown[] = [];

    if (fields.categoryId !== undefined) {
      sets.push('category_id = ?');
      params.push(fields.categoryId);
    }
    if (fields.title !== undefined) {
      sets.push('title = ?');
      params.push(fields.title);
    }
    if (fields.description !== undefined) {
      sets.push('description = ?');
      params.push(fields.description);
    }
    if (fields.locationLabel !== undefined) {
      sets.push('location_label = ?');
      params.push(fields.locationLabel);
    }
    if (fields.latitude !== undefined) {
      sets.push('latitude = ?');
      params.push(fields.latitude);
    }
    if (fields.longitude !== undefined) {
      sets.push('longitude = ?');
      params.push(fields.longitude);
    }
    sets.push('updated_at = ?');
    params.push(fields.updatedAt, reportId);

    await this.db
      .prepare(`UPDATE reports SET ${sets.join(', ')} WHERE id = ?`)
      .bind(...params)
      .run();
  }

  async transitionStatusAtomic(params: {
    reportId: string;
    fromStatus: ReportStatus;
    toStatus: ReportStatus;
    actorId: string;
    comment: string | null;
    departmentId?: string | null;
    assignedOfficerId?: string | null;
    priority?: ReportPriority;
    resolvedAt?: string | null;
    now: string;
    historyId: string;
    auditId?: string;
    auditAction?: string;
    auditMetadataJson?: string;
  }): Promise<void> {
    const statements: D1PreparedStatement[] = [
      this.db
        .prepare(
          `UPDATE reports
           SET status = ?,
               department_id = COALESCE(?, department_id),
               assigned_officer_id = COALESCE(?, assigned_officer_id),
               priority = COALESCE(?, priority),
               resolved_at = COALESCE(?, resolved_at),
               updated_at = ?
           WHERE id = ? AND status = ?`,
        )
        .bind(
          params.toStatus,
          params.departmentId ?? null,
          params.assignedOfficerId ?? null,
          params.priority ?? null,
          params.resolvedAt ?? null,
          params.now,
          params.reportId,
          params.fromStatus,
        ),
      this.db
        .prepare(
          `INSERT INTO report_status_history (id, report_id, actor_id, from_status, to_status, comment, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          params.historyId,
          params.reportId,
          params.actorId,
          params.fromStatus,
          params.toStatus,
          params.comment,
          params.now,
        ),
    ];

    if (params.auditId && params.auditAction) {
      statements.push(
        this.db
          .prepare(
            `INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, metadata_json, created_at)
             VALUES (?, ?, ?, 'REPORT', ?, ?, ?)`,
          )
          .bind(
            params.auditId,
            params.actorId,
            params.auditAction,
            params.reportId,
            params.auditMetadataJson ?? null,
            params.now,
          ),
      );
    }

    await this.db.batch(statements);
  }

  async getStatusHistory(reportId: string): Promise<ReportStatusHistoryItem[]> {
    const { results } = await this.db
      .prepare(
        `SELECT h.id, h.report_id, h.actor_id, u.display_name AS actor_name,
                h.from_status, h.to_status, h.comment, h.created_at
         FROM report_status_history h
         LEFT JOIN users u ON u.id = h.actor_id
         WHERE h.report_id = ?
         ORDER BY h.created_at ASC`,
      )
      .bind(reportId)
      .all<{
        id: string;
        report_id: string;
        actor_id: string;
        actor_name?: string;
        from_status: ReportStatus | null;
        to_status: ReportStatus;
        comment: string | null;
        created_at: string;
      }>();

    return results.map((r) => ({
      id: r.id,
      reportId: r.report_id,
      actorId: r.actor_id,
      actorName: r.actor_name,
      fromStatus: r.from_status,
      toStatus: r.to_status,
      comment: r.comment,
      createdAt: r.created_at,
    }));
  }

  async listNotes(reportId: string, includeInternal: boolean): Promise<ReportNote[]> {
    const visibilityFilter = includeInternal ? '' : `AND n.visibility = 'PUBLIC'`;
    const { results } = await this.db
      .prepare(
        `SELECT n.id, n.report_id, n.author_id, u.display_name AS author_name,
                n.body, n.visibility, n.created_at
         FROM report_notes n
         LEFT JOIN users u ON u.id = n.author_id
         WHERE n.report_id = ? ${visibilityFilter}
         ORDER BY n.created_at ASC`,
      )
      .bind(reportId)
      .all<{
        id: string;
        report_id: string;
        author_id: string;
        author_name?: string;
        body: string;
        visibility: NoteVisibility;
        created_at: string;
      }>();

    return results.map((n) => ({
      id: n.id,
      reportId: n.report_id,
      authorId: n.author_id,
      authorName: n.author_name,
      body: n.body,
      visibility: n.visibility,
      createdAt: n.created_at,
    }));
  }

  async addNote(note: ReportNote): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO report_notes (id, report_id, author_id, body, visibility, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(note.id, note.reportId, note.authorId, note.body, note.visibility, note.createdAt)
      .run();
  }

  async countAttachments(reportId: string): Promise<number> {
    const row = await this.db
      .prepare(`SELECT COUNT(*) AS cnt FROM report_attachments WHERE report_id = ?`)
      .bind(reportId)
      .first<{ cnt: number }>();
    return Number(row?.cnt ?? 0);
  }

  async createAttachment(params: ReportAttachment & { objectKey: string }): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO report_attachments (id, report_id, uploaded_by, object_key, original_filename, content_type, size_bytes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        params.id,
        params.reportId,
        params.uploadedBy,
        params.objectKey,
        params.originalFilename,
        params.contentType,
        params.sizeBytes,
        params.createdAt,
      )
      .run();
  }

  async listAttachments(reportId: string): Promise<ReportAttachment[]> {
    const { results } = await this.db
      .prepare(
        `SELECT id, report_id, uploaded_by, original_filename, content_type, size_bytes, created_at
         FROM report_attachments WHERE report_id = ? ORDER BY created_at ASC`,
      )
      .bind(reportId)
      .all<{
        id: string;
        report_id: string;
        uploaded_by: string;
        original_filename: string;
        content_type: string;
        size_bytes: number;
        created_at: string;
      }>();

    return results.map((a) => ({
      id: a.id,
      reportId: a.report_id,
      uploadedBy: a.uploaded_by,
      originalFilename: a.original_filename,
      contentType: a.content_type,
      sizeBytes: a.size_bytes,
      createdAt: a.created_at,
    }));
  }

  async findAttachmentById(
    attachmentId: string,
  ): Promise<(ReportAttachment & { objectKey: string }) | null> {
    const row = await this.db
      .prepare(
        `SELECT id, report_id, uploaded_by, object_key, original_filename, content_type, size_bytes, created_at
         FROM report_attachments WHERE id = ? LIMIT 1`,
      )
      .bind(attachmentId)
      .first<{
        id: string;
        report_id: string;
        uploaded_by: string;
        object_key: string;
        original_filename: string;
        content_type: string;
        size_bytes: number;
        created_at: string;
      }>();

    if (!row) return null;
    return {
      id: row.id,
      reportId: row.report_id,
      uploadedBy: row.uploaded_by,
      objectKey: row.object_key,
      originalFilename: row.original_filename,
      contentType: row.content_type,
      sizeBytes: row.size_bytes,
      createdAt: row.created_at,
    };
  }

  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const statusRows = await this.db
      .prepare(`SELECT status, COUNT(*) AS cnt FROM reports GROUP BY status`)
      .all<{ status: ReportStatus; cnt: number }>();

    const byStatus = Object.fromEntries(REPORT_STATUSES.map((s) => [s, 0])) as Record<
      ReportStatus,
      number
    >;

    let totalReports = 0;
    for (const row of statusRows.results) {
      const count = Number(row.cnt);
      byStatus[row.status] = count;
      totalReports += count;
    }

    const catRows = await this.db
      .prepare(
        `SELECT c.id AS category_id, c.name AS category_name, COUNT(r.id) AS cnt
         FROM categories c
         LEFT JOIN reports r ON r.category_id = c.id
         GROUP BY c.id, c.name
         ORDER BY cnt DESC, c.name ASC`,
      )
      .all<{ category_id: string; category_name: string; cnt: number }>();

    const avgRow = await this.db
      .prepare(
        `SELECT AVG((julianday(resolved_at) - julianday(created_at)) * 24.0) AS avg_hours
         FROM reports
         WHERE status = 'RESOLVED' AND resolved_at IS NOT NULL`,
      )
      .first<{ avg_hours: number | null }>();

    const dailyRows = await this.db
      .prepare(
        `SELECT substr(created_at, 1, 10) AS date, COUNT(*) AS cnt
         FROM reports
         GROUP BY substr(created_at, 1, 10)
         ORDER BY date DESC
         LIMIT 14`,
      )
      .all<{ date: string; cnt: number }>();

    return {
      totalReports,
      byStatus,
      byCategory: catRows.results.map((r) => ({
        categoryId: r.category_id,
        categoryName: r.category_name,
        count: Number(r.cnt),
      })),
      averageResolutionHours:
        avgRow?.avg_hours != null ? Math.round(avgRow.avg_hours * 10) / 10 : null,
      recentDailyCounts: dailyRows.results
        .map((d) => ({ date: d.date, count: Number(d.cnt) }))
        .reverse(),
    };
  }
}
