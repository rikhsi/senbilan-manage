import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { type AppIconName, AppIconComponent } from '@senbilan/design-system/icons';
import { AppSkeletonComponent } from '../skeleton/app-skeleton.component';

/**
 * KPI tile for dashboards: label, big value, delta vs previous period, icon.
 * `delta` is a percentage number; the caller formats `deltaLabel` (i18n/locale).
 */
@Component({
  selector: 'app-stat-card',
  imports: [AppIconComponent, AppSkeletonComponent],
  template: `
    <div class="app-stat-card__body">
      <p class="app-stat-card__label">{{ label() }}</p>
      @if (loading()) {
        <app-skeleton width="55%" height="2rem" />
      } @else {
        <p class="app-stat-card__value">{{ value() }}</p>
      }
      @if (!loading() && deltaLabel()) {
        <p class="app-stat-card__delta" [attr.data-trend]="trend()">
          <app-icon
            [name]="
              trend() === 'up' ? 'trending-up' : trend() === 'down' ? 'trending-down' : 'minus'
            "
            size="xs"
          />
          <span>{{ deltaLabel() }}</span>
          @if (deltaHint()) {
            <span class="app-stat-card__hint">{{ deltaHint() }}</span>
          }
        </p>
      }
    </div>
    @if (icon(); as name) {
      <div class="app-stat-card__icon" [attr.data-tone]="tone()">
        <app-icon [name]="name" size="md" />
      </div>
    }
  `,
  styleUrl: './app-stat-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-stat-card' },
})
export class AppStatCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly delta = input<number | null>(null);
  readonly deltaLabel = input('');
  readonly deltaHint = input('');
  readonly icon = input<AppIconName | null>(null);
  readonly tone = input<
    'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'danger'
  >('primary');
  readonly loading = input(false);
  /** For metrics where lower is better (e.g. errors) — flips the color semantics. */
  readonly invertTrend = input(false);

  protected readonly trend = computed<'up' | 'down' | 'flat'>(() => {
    const delta = this.delta();
    if (delta === null || delta === 0) {
      return 'flat';
    }
    const positive = delta > 0;
    return positive !== this.invertTrend() ? 'up' : 'down';
  });
}
