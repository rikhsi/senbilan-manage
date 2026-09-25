import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { NotificationRepository } from '@senbilan/core/application';
import { type Notification } from '@senbilan/core/domain';
import { NotificationItemComponent, NotificationQueries } from '@senbilan/entities/notification';
import { AppButtonComponent, AppSwitchComponent } from '@senbilan/design-system/ui';

@Component({
  selector: 'notifications-page',
  imports: [TranslocoPipe, AppButtonComponent, AppSwitchComponent, NotificationItemComponent],
  templateUrl: './notifications-page.component.html',
  styleUrl: './notifications-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsPageComponent {
  private readonly queries = inject(NotificationQueries);
  private readonly repo = inject(NotificationRepository, { optional: true });

  protected readonly unreadOnly = signal(false);
  protected readonly items = signal<readonly Notification[]>([]);
  protected readonly loading = signal(false);

  constructor() {
    void this.reload();
  }

  protected onUnreadOnly(checked: boolean): void {
    this.unreadOnly.set(checked);
    void this.reload();
  }

  protected async onMarkRead(notification: Notification): Promise<void> {
    await this.queries.markRead(notification.id);
    await this.reload();
  }

  protected async markAllRead(): Promise<void> {
    await this.queries.markAllRead();
    await this.reload();
  }

  private async reload(): Promise<void> {
    if (!this.repo) {
      this.items.set([]);
      return;
    }
    this.loading.set(true);
    try {
      const page = await this.queries
        .listOptions({
          page: 1,
          size: 50,
          filter: { unreadOnly: this.unreadOnly() },
        })
        .queryFn({ signal: new AbortController().signal });
      this.items.set(page.items);
    } finally {
      this.loading.set(false);
    }
  }
}
