import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type CardVariant = 'elevated' | 'outlined' | 'filled' | 'tinted';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

/**
 * Surface container. Elevated by default (depth by shadow, not border); use
 * `outlined` in dense lists, `tinted` to highlight one block per screen.
 *
 * ```html
 * <app-card variant="elevated" padding="md">
 *   <app-card-header>…</app-card-header>   (optional, plain element with class)
 *   …
 * </app-card>
 * ```
 */
@Component({
  selector: 'app-card',
  template: '<ng-content />',
  styleUrl: './app-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-card',
    '[attr.data-variant]': 'variant()',
    '[attr.data-padding]': 'padding()',
    '[class.app-card--interactive]': 'interactive()',
    '[attr.tabindex]': 'interactive() ? 0 : null',
  },
})
export class AppCardComponent {
  readonly variant = input<CardVariant>('elevated');
  readonly padding = input<CardPadding>('md');
  /** Hover/focus affordance for clickable cards (mobile list items, dashboard tiles). */
  readonly interactive = input(false);
}
