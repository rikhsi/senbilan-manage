import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AppIconComponent, type AppIconName } from '@senbilan/design-system/icons';
import { type ButtonSize, type ButtonVariant } from './button.types';

export type { ButtonSize, ButtonVariant } from './button.types';
export { BUTTON_SIZES, BUTTON_VARIANTS } from './button.types';

/**
 * Primary action component. One `primary` per screen region.
 *
 * ```html
 * <button app-button variant="primary" icon="plus" (click)="create()">{{ t('users.create') }}</button>
 * <a app-button variant="ghost" routerLink="/users">…</a>
 * ```
 * Applied as an attribute so native `<button>`/`<a>` semantics and `type`, `disabled`,
 * `routerLink` keep working without re-implementation.
 */
@Component({
  selector: 'button[app-button], a[app-button]',
  imports: [AppIconComponent],
  template: `
    @if (loading()) {
      <app-icon class="app-button__spinner" name="loader" [size]="iconSize()" [spin]="true" />
    } @else if (icon()) {
      <app-icon class="app-button__icon" [name]="icon()!" [size]="iconSize()" />
    }
    <span class="app-button__label"><ng-content /></span>
    @if (iconEnd()) {
      <app-icon class="app-button__icon" [name]="iconEnd()!" [size]="iconSize()" />
    }
  `,
  styleUrl: './app-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-button',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
    '[class.app-button--block]': 'block()',
    '[class.app-button--loading]': 'loading()',
    '[class.app-button--icon-only]': 'iconOnly()',
    '[attr.aria-busy]': 'loading() || null',
    '[attr.aria-disabled]': 'loading() ? "true" : null',
    '[attr.tabindex]': 'loading() ? -1 : null',
  },
})
export class AppButtonComponent {
  readonly variant = input<ButtonVariant>('secondary');
  readonly size = input<ButtonSize>('md');
  readonly icon = input<AppIconName | null>(null);
  readonly iconEnd = input<AppIconName | null>(null);
  readonly loading = input(false);
  readonly block = input(false);
  /** Set when the button has no text (aria-label is then required by the caller). */
  readonly iconOnly = input(false);

  protected readonly iconSize = computed(() => (this.size() === 'sm' ? 'sm' : 'md'));
}
