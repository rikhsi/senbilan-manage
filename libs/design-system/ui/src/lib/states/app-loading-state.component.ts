import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AppIconComponent } from '@senbilan/design-system/icons';

/** Centered spinner with optional label. Prefer skeletons for content areas; use this for actions/overlays. */
@Component({
  selector: 'app-loading-state',
  imports: [AppIconComponent],
  template: `
    <app-icon name="loader" [spin]="true" [size]="size() === 'sm' ? 'md' : 'lg'" />
    @if (label()) {
      <span class="app-loading-state__label">{{ label() }}</span>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--app-space-3);
      align-items: center;
      justify-content: center;
      padding: var(--app-space-8);
      color: var(--app-color-text-tertiary);
    }
    :host[data-size='sm'] {
      padding: var(--app-space-4);
    }
    :host[data-inline] {
      flex-direction: row;
      padding: 0;
    }
    .app-loading-state__label {
      font-size: var(--app-font-size-sm);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-loading-state',
    role: 'status',
    'aria-live': 'polite',
    '[attr.aria-label]': 'label() || null',
    '[attr.data-size]': 'size()',
    '[attr.data-inline]': 'inline() ? "" : null',
  },
})
export class AppLoadingStateComponent {
  readonly label = input<string>('');
  readonly size = input<'sm' | 'md'>('md');
  readonly inline = input(false);
}
