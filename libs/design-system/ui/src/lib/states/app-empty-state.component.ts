import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AppIconComponent, type AppIconName } from '@senbilan/design-system/icons';

/**
 * Empty / error / info placeholder with one optional action (projected).
 *
 * ```html
 * <app-empty-state icon="users" [title]="t('users.empty.title')" [description]="t('users.empty.body')">
 *   <button app-button variant="primary" icon="plus">{{ t('users.create') }}</button>
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
  readonly icon = input<AppIconName>('info');
  readonly title = input.required<string>();
  readonly description = input<string>('');
  readonly tone = input<'neutral' | 'danger' | 'primary'>('neutral');
  readonly size = input<'sm' | 'md'>('md');
}
