import { inject, Injectable } from '@angular/core';
import {
  MarkAllNotificationsReadUseCase,
  MarkNotificationReadUseCase,
  type NotificationListFilter,
  NotificationRepository,
  type Page,
  type PageRequest,
  NotificationQueries as NotificationQueryUseCases,
} from '@senbilan/core/application';
import { IsoDateTime, type Notification, type NotificationId } from '@senbilan/core/domain';
import { queryKeys } from '@senbilan/shared/query';
import {
  injectMutation,
  injectQueryClient,
  queryOptions,
} from '@tanstack/angular-query-experimental';

export const notificationQueryKeys = {
  ...queryKeys.notifications,
  unreadCount: () => [...queryKeys.notifications.all, 'unread-count'] as const,
};

@Injectable({ providedIn: 'root' })
export class NotificationQueries {
  private readonly notifications = inject(NotificationRepository);
  private readonly queries = new NotificationQueryUseCases(this.notifications);

  listOptions(request: PageRequest<NotificationListFilter>) {
    return queryOptions({
      queryKey: notificationQueryKeys.list(request),
      queryFn: ({ signal }) => this.queries.getPage(request, signal),
    });
  }

  unreadCountOptions() {
    return queryOptions({
      queryKey: notificationQueryKeys.unreadCount(),
      queryFn: ({ signal }) => this.queries.countUnread(signal),
    });
  }
}

@Injectable({ providedIn: 'root' })
export class NotificationMutations {
  private readonly notifications = inject(NotificationRepository);
  private readonly queryClient = injectQueryClient();

  readonly markRead = injectMutation(() => ({
    mutationFn: (id: NotificationId) =>
      new MarkNotificationReadUseCase(this.notifications).execute(id),
    onMutate: async (id) => {
      await this.queryClient.cancelQueries({ queryKey: notificationQueryKeys.all });
      const previousLists = this.queryClient.getQueriesData<Page<Notification>>({
        queryKey: notificationQueryKeys.lists(),
      });
      const previousUnread = this.queryClient.getQueryData<number>(
        notificationQueryKeys.unreadCount(),
      );

      this.queryClient.setQueriesData<Page<Notification>>(
        { queryKey: notificationQueryKeys.lists() },
        (page) => {
          if (!page) {
            return page;
          }
          return {
            ...page,
            items: page.items.map((item) =>
              item.id === id
                ? { ...item, readAt: item.readAt ?? IsoDateTime(new Date().toISOString()) }
                : item,
            ),
          };
        },
      );
      if (typeof previousUnread === 'number' && previousUnread > 0) {
        this.queryClient.setQueryData(notificationQueryKeys.unreadCount(), previousUnread - 1);
      }

      return { previousLists, previousUnread };
    },
    onError: (_error, _id, context) => {
      if (!context) {
        return;
      }
      for (const [key, data] of context.previousLists) {
        this.queryClient.setQueryData(key, data);
      }
      if (context.previousUnread !== undefined) {
        this.queryClient.setQueryData(notificationQueryKeys.unreadCount(), context.previousUnread);
      }
    },
    onSettled: async () => {
      await this.queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
    },
  }));

  readonly markAllRead = injectMutation(() => ({
    mutationFn: () => new MarkAllNotificationsReadUseCase(this.notifications).execute(),
    onMutate: async () => {
      await this.queryClient.cancelQueries({ queryKey: notificationQueryKeys.all });
      const previousLists = this.queryClient.getQueriesData<Page<Notification>>({
        queryKey: notificationQueryKeys.lists(),
      });
      const previousUnread = this.queryClient.getQueryData<number>(
        notificationQueryKeys.unreadCount(),
      );
      const now = IsoDateTime(new Date().toISOString());
      this.queryClient.setQueriesData<Page<Notification>>(
        { queryKey: notificationQueryKeys.lists() },
        (page) => {
          if (!page) {
            return page;
          }
          return {
            ...page,
            items: page.items.map((item) => ({
              ...item,
              readAt: item.readAt ?? now,
            })),
          };
        },
      );
      this.queryClient.setQueryData(notificationQueryKeys.unreadCount(), 0);
      return { previousLists, previousUnread };
    },
    onError: (_error, _vars, context) => {
      if (!context) {
        return;
      }
      for (const [key, data] of context.previousLists) {
        this.queryClient.setQueryData(key, data);
      }
      if (context.previousUnread !== undefined) {
        this.queryClient.setQueryData(notificationQueryKeys.unreadCount(), context.previousUnread);
      }
    },
    onSettled: async () => {
      await this.queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
    },
  }));
}
