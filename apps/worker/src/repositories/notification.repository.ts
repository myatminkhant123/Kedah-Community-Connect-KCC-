import type { NotificationItem } from '@kcc/shared';
import { nowIso } from '../lib/db.js';

export class NotificationRepository {
  constructor(private readonly db: D1Database) {}

  async create(item: NotificationItem): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO notifications (id, user_id, report_id, title, body, read_at, created_at)
         VALUES (?, ?, ?, ?, ?, NULL, ?)`,
      )
      .bind(item.id, item.userId, item.reportId, item.title, item.body, item.createdAt)
      .run();
  }

  async listForUser(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<{ items: NotificationItem[]; total: number }> {
    const countRow = await this.db
      .prepare(`SELECT COUNT(*) AS total FROM notifications WHERE user_id = ?`)
      .bind(userId)
      .first<{ total: number }>();

    const { results } = await this.db
      .prepare(
        `SELECT id, user_id, report_id, title, body, read_at, created_at
         FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      )
      .bind(userId, limit, offset)
      .all<{
        id: string;
        user_id: string;
        report_id: string | null;
        title: string;
        body: string;
        read_at: string | null;
        created_at: string;
      }>();

    return {
      items: results.map((n) => ({
        id: n.id,
        userId: n.user_id,
        reportId: n.report_id,
        title: n.title,
        body: n.body,
        readAt: n.read_at,
        createdAt: n.created_at,
      })),
      total: Number(countRow?.total ?? 0),
    };
  }

  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const result = await this.db
      .prepare(
        `UPDATE notifications SET read_at = COALESCE(read_at, ?) WHERE id = ? AND user_id = ?`,
      )
      .bind(nowIso(), notificationId, userId)
      .run();
    return (result.meta.changes ?? 0) > 0;
  }
}
