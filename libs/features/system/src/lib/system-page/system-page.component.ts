import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { AdminCatalogRepository, type AdminSystemSnapshot } from '@senbilan/core/application';
import {
  AppDetailFieldsComponent,
  AppDetailPageComponent,
  type BreadcrumbItem,
  type DetailField,
} from '@senbilan/design-system/layout';
import { AppButtonComponent, AppEmptyStateComponent } from '@senbilan/design-system/ui';
import { injectTranslocoReady } from '@senbilan/shared/i18n';

@Component({
  selector: 'system-page',
  imports: [
    TranslocoPipe,
    AppDetailPageComponent,
    AppDetailFieldsComponent,
    AppButtonComponent,
    AppEmptyStateComponent,
  ],
  templateUrl: './system-page.component.html',
  styleUrl: './system-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SystemPageComponent {
  private readonly catalog = inject(AdminCatalogRepository);
  private readonly i18n = inject(TranslocoService);
  private readonly i18nReady = injectTranslocoReady();

  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly info = signal<AdminSystemSnapshot | null>(null);
  protected readonly breadcrumbs: readonly BreadcrumbItem[] = [
    { labelKey: 'nav.dashboard', route: '/dashboard' },
    { labelKey: 'nav.system' },
  ];

  protected readonly fields = computed<readonly DetailField[]>(() => {
    this.i18nReady();
    const info = this.info();
    if (!info) {
      return [];
    }
    return [
      { label: this.i18n.translate('system.version'), value: this.text(info.version) },
      { label: this.i18n.translate('system.environment'), value: this.text(info.environment) },
      { label: this.i18n.translate('system.schema'), value: this.text(info.schemaVersion) },
      {
        label: this.i18n.translate('system.startedAt'),
        value: this.formatTimestamp(info.startedAt),
      },
    ];
  });

  constructor() {
    void this.reload();
  }

  protected async reload(): Promise<void> {
    this.loading.set(true);
    this.error.set(false);
    try {
      this.info.set(await this.catalog.getSystem());
    } catch {
      this.info.set(null);
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  private text(value: string): string {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : '—';
  }

  private formatTimestamp(value: string | null): string {
    if (!value) {
      return '—';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '—';
    }
    return new Intl.DateTimeFormat(this.i18n.getActiveLang(), {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  }
}
