import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { isUnread, type Notification, type NotificationKind } from '@senbilan/core/domain';
import { AppIconComponent, type AppIconName } from '@senbilan/design-system/icons';
import { AppButtonComponent, type Tone } from '@senbilan/design-system/ui';

const KIND_TONE: Record<NotificationKind, Tone> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
};

const KIND_ICON: Record<NotificationKind, AppIconName> = {
  info: 'info',
  success: 'check-circle',
  warning: 'alert-triangle',
  danger: 'circle-alert',
};

@Component({
  selector: 'entity-notification-item',
  imports: [DatePipe, AppIconComponent, AppButtonComponent],
  templateUrl: './notification-item.component.html',
  styleUrl: './notification-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'entity-notification-item',
    '[class.entity-notification-item--unread]': 'unread()',
    '[attr.data-tone]': 'tone()',
  },
})
export class NotificationItemComponent {
  readonly notification = input.required<Notification>();
  readonly markReadLabel = input.required<string>();
  readonly markRead = output<Notification>();

  protected readonly unread = computed(() => isUnread(this.notification()));
  protected readonly tone = computed(() => KIND_TONE[this.notification().kind]);
  protected readonly icon = computed(() => KIND_ICON[this.notification().kind]);

  protected onMarkRead(): void {
    if (this.unread()) {
      this.markRead.emit(this.notification());
    }
  }
}
