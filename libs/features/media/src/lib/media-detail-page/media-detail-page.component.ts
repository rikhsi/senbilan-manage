import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { AdminCatalogRepository, type AdminMediaSummary } from '@senbilan/core/application';
import {
  AppDetailFieldsComponent,
  AppDetailPageComponent,
  type BreadcrumbItem,
  type DetailField,
} from '@senbilan/design-system/layout';
import {
  AppButtonComponent,
  AppConfirmDialogService,
  AppEmptyStateComponent,
  ToastService,
} from '@senbilan/design-system/ui';
import { injectTranslocoReady, readLoadedTranslation } from '@senbilan/shared/i18n';

@Component({
  selector: 'media-detail-page',
  imports: [
    TranslocoPipe,
    AppDetailPageComponent,
    AppDetailFieldsComponent,
    AppButtonComponent,
    AppEmptyStateComponent,
  ],
  templateUrl: './media-detail-page.component.html',
  styleUrl: './media-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MediaDetailPageComponent {
  private readonly catalog = inject(AdminCatalogRepository);
  private readonly i18n = inject(TranslocoService);
  private readonly i18nReady = injectTranslocoReady();
  private readonly confirm = inject(AppConfirmDialogService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();
  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly busy = signal(false);
  protected readonly detail = signal<AdminMediaSummary | null>(null);

  protected readonly breadcrumbs = computed<readonly BreadcrumbItem[]>(() => {
    this.i18nReady();
    const item = this.detail();
    return [
      { labelKey: 'nav.dashboard', route: '/dashboard' },
      { labelKey: 'nav.media', route: '/media' },
      {
        label: item
          ? this.text(item.purpose)
          : readLoadedTranslation(this.i18n, 'media.detailTitle'),
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
      { label: this.i18n.translate('media.purpose'), value: this.text(item.purpose) },
      { label: this.i18n.translate('media.contentType'), value: this.text(item.contentType) },
      { label: this.i18n.translate('media.status'), value: this.text(item.status) },
      { label: this.i18n.translate('media.size'), value: this.text(item.sizeBytes) },
      { label: this.i18n.translate('media.width'), value: String(item.width) },
      { label: this.i18n.translate('media.height'), value: String(item.height) },
      { label: this.i18n.translate('media.owner'), value: this.text(item.ownerId) },
      { label: this.i18n.translate('media.couple'), value: this.text(item.coupleId) },
      {
        label: this.i18n.translate('media.createdAt'),
        value: this.formatTimestamp(item.createdAt),
      },
      { label: this.i18n.translate('media.id'), value: this.text(item.id) },
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
      const found = await this.findMedia(this.id());
      this.detail.set(found);
      this.error.set(found === null);
    } catch {
      this.detail.set(null);
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  protected async remove(): Promise<void> {
    const ok = await this.confirm.ask({
      title: this.i18n.translate('media.deleteConfirmTitle'),
      message: this.i18n.translate('media.deleteConfirmMessage'),
      confirmLabel: this.i18n.translate('media.delete'),
      cancelLabel: this.i18n.translate('common.cancel'),
      tone: 'danger',
    });
    if (!ok) {
      return;
    }
    this.busy.set(true);
    try {
      await this.catalog.deleteMedia(this.id());
      this.toast.show({ tone: 'success', title: this.i18n.translate('media.deleted') });
      void this.router.navigateByUrl('/media');
    } catch {
      this.toast.show({
        tone: 'danger',
        title: this.i18n.translate('media.errorTitle'),
        message: this.i18n.translate('media.errorHint'),
      });
    } finally {
      this.busy.set(false);
    }
  }

  private async findMedia(mediaId: string): Promise<AdminMediaSummary | null> {
    let cursor: string | undefined;
    for (let pageIndex = 0; pageIndex < 20; pageIndex += 1) {
      const page = await this.catalog.listMedia({
        limit: 50,
        ...(cursor !== undefined ? { cursor } : {}),
      });
      const found = page.items.find((item) => item.id === mediaId);
      if (found) {
        return found;
      }
      if (!page.nextCursor) {
        return null;
      }
      cursor = page.nextCursor;
    }
    return null;
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
