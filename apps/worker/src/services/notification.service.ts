import type { NotificationItem, PublicUser } from '@kcc/shared';
import { notFound } from '../lib/errors.js';
import { NotificationRepository } from '../repositories/notification.repository.js';

export class NotificationService {
  constructor(private readonly notificationRepo: NotificationRepository) {}

  async listForUser(
    user: PublicUser,
    limit: number,
    offset: number,
  ): Promise<{ items: NotificationItem[]; total: number }> {
    return this.notificationRepo.listForUser(user.id, limit, offset);
  }

  async markAsRead(user: PublicUser, notificationId: string): Promise<void> {
    const updated = await this.notificationRepo.markAsRead(notificationId, user.id);
    if (!updated) {
      throw notFound('Notification not found');
    }
  }
}
