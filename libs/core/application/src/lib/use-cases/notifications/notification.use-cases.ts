import { type Notification, type NotificationId } from '@senbilan/core/domain';
import { type Page, type PageRequest } from '../../contracts/pagination';
import {
  type NotificationListFilter,
  type NotificationRepository,
} from '../../ports/notification.repository';

export class NotificationQueries {
  constructor(private readonly notifications: NotificationRepository) {}

  getPage(request: PageRequest<NotificationListFilter>, signal?: AbortSignal): Promise<Page<Notification>> {
    return this.notifications.findPage(request, signal);
  }

  countUnread(signal?: AbortSignal): Promise<number> {
    return this.notifications.countUnread(signal);
  }
}

export class MarkNotificationReadUseCase {
  constructor(private readonly notifications: NotificationRepository) {}

  execute(id: NotificationId): Promise<Notification> {
    return this.notifications.markRead(id);
  }
}

export class MarkAllNotificationsReadUseCase {
  constructor(private readonly notifications: NotificationRepository) {}

  execute(): Promise<void> {
    return this.notifications.markAllRead();
  }
}
