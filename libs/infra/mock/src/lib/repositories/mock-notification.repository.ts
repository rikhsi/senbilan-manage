import { Injectable, inject } from '@angular/core';
import {
  NotFoundError,
  NotificationRepository,
  type NotificationListFilter,
  type Page,
  type PageRequest,
} from '@senbilan/core/application';
import {
  IsoDateTime,
  markRead,
  type Notification,
  type NotificationId,
} from '@senbilan/core/domain';
import { MockDataStore } from '../mock-data.store';

@Injectable()
export class MockNotificationRepository extends NotificationRepository {
  private readonly store = inject(MockDataStore);

  override async findPage(
    request: PageRequest<NotificationListFilter>,
    _signal?: AbortSignal,
  ): Promise<Page<Notification>> {
    let items = [...this.store.db.notifications];
    if (request.filter?.unreadOnly) {
      items = items.filter((n) => n.readAt === null);
    }
    const start = (request.page - 1) * request.size;
    return {
      items: items.slice(start, start + request.size),
      total: items.length,
      page: request.page,
      size: request.size,
    };
  }

  override async countUnread(_signal?: AbortSignal): Promise<number> {
    return this.store.db.notifications.filter((n) => n.readAt === null).length;
  }

  override async markRead(id: NotificationId): Promise<Notification> {
    const index = this.store.db.notifications.findIndex((n) => n.id === id);
    const current = this.store.db.notifications[index];
    if (!current) {
      throw new NotFoundError('Notification', id);
    }
    const next = markRead(current, IsoDateTime(new Date().toISOString()));
    this.store.db.notifications[index] = next;
    return next;
  }

  override async markAllRead(): Promise<void> {
    const now = IsoDateTime(new Date().toISOString());
    this.store.db.notifications = this.store.db.notifications.map((n) => markRead(n, now));
  }
}
