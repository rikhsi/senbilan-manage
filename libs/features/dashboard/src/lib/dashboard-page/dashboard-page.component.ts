import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { type DashboardRange, DashboardRepository } from '@senbilan/core/application';
import {
  type ActivityEntry,
  type DashboardOverview,
  type StatMetric,
  type TimeSeriesPoint,
} from '@senbilan/core/domain';
import { UserAvatarComponent } from '@senbilan/entities/user';
import {
  AppButtonComponent,
  AppCardComponent,
  AppChartComponent,
  AppStatCardComponent,
} from '@senbilan/design-system/ui';
import type { ChartData } from 'chart.js';
import type { AppIconName } from '@senbilan/design-system/icons';

const METRIC_ICONS: Record<StatMetric['key'], AppIconName> = {
  'users.total': 'users',
  'users.active': 'user-check',
  'users.invited': 'user-plus',
  'roles.total': 'shield',
};

@Component({
  selector: 'dashboard-page',
  imports: [
    DatePipe,
    RouterLink,
    TranslocoPipe,
    AppButtonComponent,
    AppCardComponent,
    AppChartComponent,
    AppStatCardComponent,
    UserAvatarComponent,
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  private readonly i18n = inject(TranslocoService);
  private readonly dashboard = inject(DashboardRepository, { optional: true });

  protected readonly range = signal<DashboardRange>('30d');
  protected readonly loading = signal(false);
  protected readonly overview = signal<DashboardOverview | null>(null);

  protected readonly chartData = computed<ChartData>(() => {
    const points = this.overview()?.signups ?? ([] as readonly TimeSeriesPoint[]);
    return {
      labels: points.map((p) => p.at.slice(0, 10)),
      datasets: [
        {
          label: this.i18n.translate('dashboard.chartTitle'),
          data: points.map((p) => p.value),
        },
      ],
    };
  });

  protected readonly activity = computed(
    () => this.overview()?.activity ?? ([] as readonly ActivityEntry[]),
  );

  constructor() {
    void this.reload();
  }

  protected setRange(range: DashboardRange): void {
    this.range.set(range);
    void this.reload();
  }

  protected metricLabel(key: StatMetric['key']): string {
    return this.i18n.translate(`dashboard.metrics.${key}`);
  }

  protected metricIcon(key: StatMetric['key']): AppIconName {
    return METRIC_ICONS[key];
  }

  protected formatDelta(delta: number | null): string {
    if (delta === null) {
      return '';
    }
    const pct = Math.round(delta * 100);
    return `${pct > 0 ? '+' : ''}${pct}%`;
  }

  protected activityLabel(entry: ActivityEntry): string {
    return `${entry.actor.firstName} ${entry.actor.lastName} · ${entry.action} · ${entry.target}`;
  }

  private async reload(): Promise<void> {
    if (!this.dashboard) {
      this.overview.set(null);
      return;
    }
    this.loading.set(true);
    try {
      this.overview.set(await this.dashboard.getOverview(this.range()));
    } finally {
      this.loading.set(false);
    }
  }
}
