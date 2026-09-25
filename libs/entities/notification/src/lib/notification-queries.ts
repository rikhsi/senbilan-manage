import { inject, Injectable } from '@angular/core';
import {
  type NotificationListFilter,
  NotificationRepository,
  type PageRequest,
} from '@senbilan/core/application';
import { type NotificationId } from '@senbilan/core/domain';

export const notificationQueryKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationQueryKeys.all, 'list'] as const,
  list: (request: PageRequest<NotificationListFilter>) =>
    [...notificationQueryKeys.lists(), request] as const,
  unreadCount: () => [...notificationQueryKeys.all, 'unread-count'] as const,
};

@Injectable({ providedIn: 'root' })
export class NotificationQueries {
  private readonly notifications = inject(NotificationRepository);

  listOptions(request: PageRequest<NotificationListFilter>) {
    return {
      queryKey: notificationQueryKeys.list(request),
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        this.notifications.findPage(request, signal),
    };
  }

  unreadCountOptions() {
    return {
      queryKey: notificationQueryKeys.unreadCount(),
      queryFn: ({ signal }: { signal: AbortSignal }) => this.notifications.countUnread(signal),
    };
  }

  markRead(id: NotificationId): Promise<unknown> {
    return this.notifications.markRead(id);
  }

  markAllRead(): Promise<void> {
    return this.notifications.markAllRead();
  }
}
