import { type DialogRef } from '@angular/cdk/dialog';
import { type AppModalService } from '@senbilan/design-system/ui';
import { NotificationsInboxDialogComponent } from './notifications-inbox-dialog.component';

/** Opens the header notifications inbox (empty list until API exists). */
export const openNotificationsInbox = (
  modal: AppModalService,
  ariaLabel: string,
): DialogRef<unknown, NotificationsInboxDialogComponent> =>
  modal.open(NotificationsInboxDialogComponent, {
    size: 'md',
    ariaLabel,
  });
