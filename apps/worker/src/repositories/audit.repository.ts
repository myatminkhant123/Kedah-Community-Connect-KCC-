import { nowIso } from '../lib/db.js';

export class AuditRepository {
  constructor(private readonly db: D1Database) {}

  async record(params: {
    id: string;
    actorId: string | null;
    action: string;
    entityType: string;
    entityId: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, metadata_json, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        params.id,
        params.actorId,
        params.action,
        params.entityType,
        params.entityId,
        params.metadata ? JSON.stringify(params.metadata) : null,
        nowIso(),
      )
      .run();
  }
}
