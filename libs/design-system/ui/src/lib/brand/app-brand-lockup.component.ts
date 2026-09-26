import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { BRAND_LOGO_SRC, brandMarkParts, type BrandLockupSize } from './brand.types';

/**
 * Heart plus the SenBilan wordmark. `sm` matches the sidebar; `md` is the same
 * lockup at login and splash scale.
 */
@Component({
  selector: 'app-brand-lockup',
  template: `
    <img
      class="app-brand-lockup__logo"
      [src]="logoSrc"
      alt=""
      width="32"
      height="32"
      decoding="async"
    />
    <span class="app-brand-lockup__name" aria-hidden="true">
      <span class="app-brand-lockup__lead">{{ mark().lead }}</span>
      <span class="app-brand-lockup__tail">{{ mark().tail }}</span>
    </span>
  `,
  styleUrl: './app-brand-lockup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-brand-lockup',
    '[class.app-brand-lockup--md]': 'size() === "md"',
    '[class.app-brand-lockup--compact]': 'compact()',
    '[attr.aria-label]': 'label()',
  },
})
export class AppBrandLockupComponent {
  readonly label = input.required<string>();
  readonly size = input<BrandLockupSize>('sm');
  /** Hides the wordmark and keeps the heart, as in the collapsed sidebar. */
  readonly compact = input(false);

  protected readonly logoSrc = BRAND_LOGO_SRC;
  protected readonly mark = computed(() => brandMarkParts(this.label()));
}
