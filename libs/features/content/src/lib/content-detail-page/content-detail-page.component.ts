import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { AdminCatalogRepository, type AdminContentSummary } from '@senbilan/core/application';
import {
  AppDetailFieldsComponent,
  AppDetailPageComponent,
  type BreadcrumbItem,
  type DetailField,
} from '@senbilan/design-system/layout';
import { AppButtonComponent, AppEmptyStateComponent } from '@senbilan/design-system/ui';
import { injectTranslocoReady, readLoadedTranslation } from '@senbilan/shared/i18n';

@Component({
  selector: 'content-detail-page',
  imports: [
    TranslocoPipe,
    AppDetailPageComponent,
    AppDetailFieldsComponent,
    AppButtonComponent,
    AppEmptyStateComponent,
  ],
  templateUrl: './content-detail-page.component.html',
  styleUrl: './content-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentDetailPageComponent {
  private readonly catalog = inject(AdminCatalogRepository);
  private readonly i18n = inject(TranslocoService);
  private readonly i18nReady = injectTranslocoReady();

  readonly id = input.required<string>();

  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly detail = signal<AdminContentSummary | null>(null);

  protected readonly breadcrumbs = computed<readonly BreadcrumbItem[]>(() => {
    this.i18nReady();
    const item = this.detail();
    return [
      { labelKey: 'nav.dashboard', route: '/dashboard' },
      { labelKey: 'nav.content', route: '/content' },
      {
        label: item
          ? this.text(item.title)
          : readLoadedTranslation(this.i18n, 'content.detailTitle'),
      },
    ];
  });

  protected readonly fields = computed<readonly DetailField[]>(() => {
    this.i18nReady();
    const item = this.detail();
    if (!item) {
      return [];
    }
    return [
      { label: this.i18n.translate('content.name'), value: this.text(item.title) },
      { label: this.i18n.translate('content.kind'), value: this.text(item.kind) },
      { label: this.i18n.translate('content.status'), value: this.text(item.status) },
      { label: this.i18n.translate('content.language'), value: this.text(item.language) },
      { label: this.i18n.translate('content.url'), value: this.text(item.url) },
      {
        label: this.i18n.translate('content.publishedAt'),
        value: this.formatTimestamp(item.publishedAt),
      },
      {
        label: this.i18n.translate('content.updatedAt'),
        value: this.formatTimestamp(item.updatedAt),
      },
      { label: this.i18n.translate('content.id'), value: this.text(item.id) },
    ];
  });

  constructor() {
    effect(() => {
      if (this.id()) {
        void this.reload();
      }
    });
  }

  protected async reload(): Promise<void> {
    this.loading.set(true);
    this.error.set(false);
    this.detail.set(null);
    try {
      this.detail.set(await this.catalog.getContent(this.id()));
    } catch {
      this.detail.set(null);
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
