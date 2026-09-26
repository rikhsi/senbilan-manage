import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { type LocaleFlagId } from './locale-toggle.types';

/**
 * Inline SVG country flags — emoji flags often fail on Windows.
 */
@Component({
  selector: 'app-locale-flag',
  template: `
    @switch (locale()) {
      @case ('ru') {
        <svg viewBox="0 0 30 20" role="img" aria-hidden="true" focusable="false">
          <rect width="30" height="20" fill="#fff" />
          <rect y="6.67" width="30" height="6.66" fill="#0039a6" />
          <rect y="13.33" width="30" height="6.67" fill="#d52b1e" />
        </svg>
      }
      @case ('en') {
        <svg viewBox="0 0 60 30" role="img" aria-hidden="true" focusable="false">
          <rect width="60" height="30" fill="#012169" />
          <path d="M0 0 L60 30 M60 0 L0 30" stroke="#fff" stroke-width="6" />
          <path d="M0 0 L60 30 M60 0 L0 30" stroke="#C8102E" stroke-width="2" />
          <path d="M30 0 V30 M0 15 H60" stroke="#fff" stroke-width="10" />
          <path d="M30 0 V30 M0 15 H60" stroke="#C8102E" stroke-width="6" />
        </svg>
      }
      @case ('uz') {
        <svg viewBox="0 0 30 20" role="img" aria-hidden="true" focusable="false">
          <rect width="30" height="20" fill="#1eb53a" />
          <rect width="30" height="6.67" fill="#0099b5" />
          <rect y="6.67" width="30" height="6.66" fill="#fff" />
          <rect y="6.22" width="30" height="0.9" fill="#ce1126" />
          <rect y="12.88" width="30" height="0.9" fill="#ce1126" />
          <circle cx="6" cy="3.3" r="2" fill="#fff" />
          <circle cx="6.7" cy="3.3" r="1.6" fill="#0099b5" />
        </svg>
      }
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      flex-shrink: 0;
      width: 1.25rem;
      height: 0.85rem;
      overflow: hidden;
      border-radius: var(--app-radius-xs);
      box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--app-color-border) 70%, transparent);
    }

    svg {
      display: block;
      width: 100%;
      height: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-locale-flag' },
})
export class AppLocaleFlagComponent {
  readonly locale = input.required<LocaleFlagId>();
}
