import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AppIconComponent, type AppIconName } from '@senbilan/design-system/icons';

export const TONES = [
  'neutral',
  'primary',
  'secondary',
  'accent',
  'success',
  'warning',
  'danger',
  'info',
] as const;
export type Tone = (typeof TONES)[number];

/**
 * Compact label for counts and categories. Uses `*-container` / `on-*-container`
 * pairs so contrast is guaranteed in every theme.
 */
@Component({
  selector: 'app-badge',
  imports: [AppIconComponent],
  template: `
    @if (icon()) {
      <app-icon [name]="icon()!" size="xs" />
    }
    <ng-content />
  `,
  styleUrl: './app-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-badge',
    '[attr.data-tone]': 'tone()',
    '[attr.data-size]': 'size()',
    '[class.app-badge--pill]': 'pill()',
  },
})
export class AppBadgeComponent {
  readonly tone = input<Tone>('neutral');
  readonly size = input<'sm' | 'md'>('md');
  readonly icon = input<AppIconName | null>(null);
  readonly pill = input(false);
}
