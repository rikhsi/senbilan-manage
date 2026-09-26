import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { isUnread, type Notification } from '@senbilan/core/domain';
import { AppIconComponent } from '@senbilan/design-system/icons';
import { AppButtonComponent } from '@senbilan/design-system/ui';
import { NOTIFICATION_KIND_ICON, NOTIFICATION_KIND_TONE } from './notification-kind.maps';

@Component({
  selector: 'entity-notification-item',
  imports: [DatePipe, AppIconComponent, AppButtonComponent],
  templateUrl: './notification-item.component.html',
  styleUrl: './notification-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'entity-notification-item',
    // eslint-disable-next-line @senbilan/no-hardcoded-text-ts -- host binding expression, not UI copy
    '[class.entity-notification-item--unread]': 'unread()',
    // eslint-disable-next-line @senbilan/no-hardcoded-text-ts -- host binding expression, not UI copy
    '[attr.data-tone]': 'tone()',
  },
})
export class NotificationItemComponent {
  readonly notification = input.required<Notification>();
  readonly markReadLabel = input.required<string>();
  readonly markRead = output<Notification>();

  protected readonly unread = computed(() => isUnread(this.notification()));
  protected readonly tone = computed(() => NOTIFICATION_KIND_TONE[this.notification().kind]);
  protected readonly icon = computed(() => NOTIFICATION_KIND_ICON[this.notification().kind]);

  protected onMarkRead(): void {
    if (this.unread()) {
      this.markRead.emit(this.notification());
    }
  }
}
