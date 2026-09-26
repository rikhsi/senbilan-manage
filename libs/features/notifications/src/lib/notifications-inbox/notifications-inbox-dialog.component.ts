import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { AppDialogShellComponent, AppEmptyStateComponent } from '@senbilan/design-system/ui';

/**
 * Header inbox modal — empty until a real notifications API is wired.
 * Uses `common.*` keys so it works without the notifications route scope.
 */
@Component({
  selector: 'notifications-inbox-dialog',
  imports: [TranslocoPipe, AppDialogShellComponent, AppEmptyStateComponent],
  template: `
    <app-dialog-shell
      [title]="'common.notifications' | transloco"
      [closeLabel]="'common.close' | transloco"
    >
      <app-empty-state
        icon="bell"
        size="sm"
        [title]="'common.empty' | transloco"
        [description]="'common.emptyHint' | transloco"
      />
    </app-dialog-shell>
  `,
  // eslint-disable-next-line @senbilan/no-hardcoded-text-ts -- component host layout CSS, not UI copy
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsInboxDialogComponent {}
