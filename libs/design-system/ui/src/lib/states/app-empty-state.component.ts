import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AppIconComponent } from '@senbilan/design-system/icons';
import { type EmptyStateIcon, type EmptyStateSize, type EmptyStateTone } from './empty-state.types';

export type { EmptyStateIcon, EmptyStateSize, EmptyStateTone } from './empty-state.types';

/**
 * Reusable empty / zero-data placeholder with one optional action (projected).
 *
 * ```html
 * <app-empty-state icon="bell" [title]="t('notifications.empty')" [description]="t('notifications.emptyHint')">
 *   <button app-button variant="primary">{{ t('common.retry') }}</button>
 * </app-empty-state>
 * ```
 */
@Component({
  selector: 'app-empty-state',
  imports: [AppIconComponent],
  template: `
    <div class="app-empty-state__icon" [attr.data-tone]="tone()">
      <app-icon [name]="icon()" size="lg" />
    </div>
    <h3 class="app-empty-state__title">{{ title() }}</h3>
    @if (description()) {
      <p class="app-empty-state__description">{{ description() }}</p>
    }
    <div class="app-empty-state__actions"><ng-content /></div>
  `,
  styleUrl: './app-empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-empty-state', '[attr.data-size]': 'size()' },
})
export class AppEmptyStateComponent {
  readonly icon = input<EmptyStateIcon>('info');
  readonly title = input.required<string>();
  readonly description = input<string>('');
  readonly tone = input<EmptyStateTone>('neutral');
  readonly size = input<EmptyStateSize>('md');
}
