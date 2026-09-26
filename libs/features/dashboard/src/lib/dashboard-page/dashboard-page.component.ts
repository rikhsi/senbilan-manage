import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { AdminCatalogRepository, type AdminStatsSnapshot } from '@senbilan/core/application';
import {
  AppButtonComponent,
  AppEmptyStateComponent,
  AppStatCardComponent,
  ToastService,
} from '@senbilan/design-system/ui';
import {
  DASHBOARD_STAT_ICONS,
  DASHBOARD_STAT_ORDER,
  type DashboardStatKey,
} from './dashboard-metrics';

@Component({
  selector: 'dashboard-page',
  imports: [TranslocoPipe, AppButtonComponent, AppStatCardComponent, AppEmptyStateComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  private readonly i18n = inject(TranslocoService);
  private readonly catalog = inject(AdminCatalogRepository);
  private readonly toast = inject(ToastService);

  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly stats = signal<AdminStatsSnapshot | null>(null);

  protected readonly cards = computed(() => {
    const data = this.stats();
    if (!data) {
      return [] as const;
    }
    return DASHBOARD_STAT_ORDER.map((key) => ({
      key,
      value: data[key],
      icon: DASHBOARD_STAT_ICONS[key],
      label: this.i18n.translate(`dashboard.metrics.${key}`),
    }));
  });

  constructor() {
    void this.reload();
  }

  protected metricIcon(key: DashboardStatKey) {
    return DASHBOARD_STAT_ICONS[key];
  }

  protected async reload(): Promise<void> {
    this.loading.set(true);
    this.error.set(false);
    try {
      this.stats.set(await this.catalog.getStats());
    } catch {
      this.stats.set(null);
      this.error.set(true);
      this.toast.show({
        tone: 'danger',
        title: this.i18n.translate('dashboard.errorTitle'),
        message: this.i18n.translate('dashboard.errorHint'),
      });
    } finally {
      this.loading.set(false);
    }
  }
}
