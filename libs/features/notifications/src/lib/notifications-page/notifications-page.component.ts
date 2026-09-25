import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { type Notification } from '@senbilan/core/domain';
import { NotificationItemComponent, NotificationQueries } from '@senbilan/entities/notification';
import {
  AppButtonComponent,
  AppEmptyStateComponent,
  AppSkeletonComponent,
  AppSwitchComponent,
} from '@senbilan/design-system/ui';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { NotificationsStore } from '../state/notifications.store';

@Component({
  selector: 'notifications-page',
  imports: [
    TranslocoPipe,
    AppButtonComponent,
    AppEmptyStateComponent,
    AppSkeletonComponent,
    AppSwitchComponent,
    NotificationItemComponent,
  ],
  templateUrl: './notifications-page.component.html',
  styleUrl: './notifications-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsPageComponent {
  private readonly queries = inject(NotificationQueries);
  protected readonly store = inject(NotificationsStore);

  private readonly listQuery = injectQuery(() =>
    this.queries.listOptions({
      page: 1,
      size: 50,
      filter: { unreadOnly: this.store.unreadOnly() },
    }),
  );

  private readonly unreadQuery = injectQuery(() => this.queries.unreadCountOptions());

  protected readonly items = computed(() => this.listQuery.data()?.items ?? []);
  protected readonly loading = computed(() => this.listQuery.isPending());
  protected readonly unreadOnly = computed(() => this.store.unreadOnly());
  protected readonly unreadCount = computed(
    () => this.unreadQuery.data() ?? this.store.unreadCount(),
  );

  protected onUnreadOnly(checked: boolean): void {
    this.store.setUnreadOnly(checked);
  }

  protected async onMarkRead(notification: Notification): Promise<void> {
    await this.store.markRead(notification.id);
  }

  protected async markAllRead(): Promise<void> {
    await this.store.markAllRead();
  }
}
