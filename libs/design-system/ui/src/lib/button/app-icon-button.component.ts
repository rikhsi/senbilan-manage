import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AppIconComponent, type AppIconName } from '@senbilan/design-system/icons';
import { type ButtonSize } from './app-button.component';

export type IconButtonVariant = 'ghost' | 'secondary' | 'primary' | 'danger';

/**
 * Square icon-only button. `label` is mandatory: it becomes the accessible name.
 *
 * ```html
 * <button app-icon-button icon="trash" variant="danger" [label]="t('common.delete')" (click)="remove()"></button>
 * ```
 */
@Component({
  selector: 'button[app-icon-button], a[app-icon-button]',
  imports: [AppIconComponent],
  template: `
    @if (loading()) {
      <app-icon name="loader" [size]="size() === 'sm' ? 'sm' : 'md'" [spin]="true" />
    } @else {
      <app-icon [name]="icon()" [size]="size() === 'sm' ? 'sm' : 'md'" />
    }
  `,
  styleUrl: './app-icon-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-icon-button',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
    '[attr.aria-label]': 'label()',
    '[attr.title]': 'label()',
    '[attr.aria-pressed]': 'pressed() === null ? null : pressed()',
    '[attr.aria-busy]': 'loading() || null',
    '[class.app-icon-button--active]': 'pressed() === true',
  },
})
export class AppIconButtonComponent {
  readonly icon = input.required<AppIconName>();
  readonly label = input.required<string>();
  readonly variant = input<IconButtonVariant>('ghost');
  readonly size = input<ButtonSize>('md');
  readonly loading = input(false);
  /** Toggle buttons: pass true/false to expose aria-pressed. */
  readonly pressed = input<boolean | null>(null);
}
