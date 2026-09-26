import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { AdminCatalogRepository, type AdminContentDetail } from '@senbilan/core/application';
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
  AppStatusComponent,
  ToastService,
} from '@senbilan/design-system/ui';
import { injectTranslocoReady, readLoadedTranslation } from '@senbilan/shared/i18n';
import { canDeleteContent, isContentPublished } from '../content-page/content-form.model';
import {
  contentKindLabelKey,
  contentLanguageLabelKey,
  contentStatusLabelKey,
  contentStatusTone,
} from '../content-page/content-page.model';

@Component({
  selector: 'content-detail-page',
  imports: [
    RouterLink,
    TranslocoPipe,
    AppDetailPageComponent,
    AppDetailFieldsComponent,
    AppButtonComponent,
    AppEmptyStateComponent,
    AppStatusComponent,
  ],
  templateUrl: './content-detail-page.component.html',
  styleUrl: './content-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentDetailPageComponent {
  private readonly catalog = inject(AdminCatalogRepository);
  private readonly i18n = inject(TranslocoService);
  private readonly i18nReady = injectTranslocoReady();
  private readonly router = inject(Router);
  private readonly confirm = inject(AppConfirmDialogService);
  private readonly toast = inject(ToastService);

  readonly id = input.required<string>();

  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly busy = signal(false);
  protected readonly detail = signal<AdminContentDetail | null>(null);

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

  protected readonly canPublish = computed(() => {
    const item = this.detail();
    return !!item && !isContentPublished(item.status);
  });

  protected readonly canUnpublish = computed(() => {
    const item = this.detail();
    return !!item && isContentPublished(item.status);
  });

  protected readonly canDelete = computed(() => {
    const item = this.detail();
    return !!item && canDeleteContent(item);
  });

  protected readonly fields = computed<readonly DetailField[]>(() => {
    this.i18nReady();
    const item = this.detail();
    if (!item) {
      return [];
    }
    const rows: DetailField[] = [
      { label: this.i18n.translate('content.name'), value: item.title.trim() },
      {
        label: this.i18n.translate('content.description'),
        value: this.plainText(item.description),
      },
      { label: this.i18n.translate('content.kind'), value: this.kindLabel(item.kind) },
      { label: this.i18n.translate('content.status'), value: this.statusLabel(item.status) },
      { label: this.i18n.translate('content.language'), value: this.languageLabel(item.language) },
      {
        label: this.i18n.translate('content.tags'),
        value: item.tags.length > 0 ? item.tags.join(', ') : '',
      },
      { label: this.i18n.translate('content.url'), value: item.url.trim() },
      {
        label: this.i18n.translate('content.unitCount'),
        value: item.unitCount > 0 ? String(item.unitCount) : '',
      },
      {
        label: this.i18n.translate('content.publishedAt'),
        value: this.formatTimestamp(item.publishedAt),
      },
      {
        label: this.i18n.translate('content.updatedAt'),
        value: this.formatTimestamp(item.updatedAt),
      },
      { label: this.i18n.translate('content.id'), value: item.id.trim() },
    ];
    return rows.filter((field) => field.value.trim().length > 0);
  });

  constructor() {
    effect(() => {
      if (this.id()) {
        void this.reload();
      }
    });
  }

  protected statusTone(status: string) {
    return contentStatusTone(status);
  }

  protected statusLabel(status: string): string {
    const key = contentStatusLabelKey(status);
    return key ? this.i18n.translate(key) : this.text(status);
  }

  protected kindLabel(kind: string): string {
    const key = contentKindLabelKey(kind);
    return key ? this.i18n.translate(key) : this.text(kind);
  }

  protected languageLabel(language: string): string {
    const key = contentLanguageLabelKey(language);
    return key ? this.i18n.translate(key) : this.text(language);
  }

  protected async publish(): Promise<void> {
    if (!this.canPublish()) {
      return;
    }
    const ok = await this.confirm.ask({
      title: this.i18n.translate('content.publishConfirmTitle'),
      message: this.i18n.translate('content.publishConfirmMessage'),
      confirmLabel: this.i18n.translate('content.publish'),
      cancelLabel: this.i18n.translate('common.cancel'),
      tone: 'primary',
    });
    if (!ok) {
      return;
    }
    await this.runMutation(() => this.catalog.publishContent(this.id()), 'content.published');
  }

  protected async unpublish(): Promise<void> {
    if (!this.canUnpublish()) {
      return;
    }
    const ok = await this.confirm.ask({
      title: this.i18n.translate('content.unpublishConfirmTitle'),
      message: this.i18n.translate('content.unpublishConfirmMessage'),
      confirmLabel: this.i18n.translate('content.unpublish'),
      cancelLabel: this.i18n.translate('common.cancel'),
      tone: 'primary',
    });
    if (!ok) {
      return;
    }
    await this.runMutation(() => this.catalog.unpublishContent(this.id()), 'content.unpublished');
  }

  protected async remove(): Promise<void> {
    if (!this.canDelete()) {
      return;
    }
    const ok = await this.confirm.ask({
      title: this.i18n.translate('content.deleteConfirmTitle'),
      message: this.i18n.translate('content.deleteConfirmMessage'),
      confirmLabel: this.i18n.translate('common.delete'),
      cancelLabel: this.i18n.translate('common.cancel'),
      tone: 'danger',
    });
    if (!ok) {
      return;
    }
    this.busy.set(true);
    try {
      await this.catalog.deleteContent(this.id());
      this.toast.show({ tone: 'success', title: this.i18n.translate('content.deleted') });
      void this.router.navigate(['/content']);
    } catch {
      this.toast.show({
        tone: 'danger',
        title: this.i18n.translate('content.saveError'),
        message: this.i18n.translate('content.errorHint'),
      });
    } finally {
      this.busy.set(false);
    }
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

  private async runMutation(
    action: () => Promise<AdminContentDetail>,
    successKey: string,
  ): Promise<void> {
    this.busy.set(true);
    try {
      this.detail.set(await action());
      this.toast.show({ tone: 'success', title: this.i18n.translate(successKey) });
    } catch {
      this.toast.show({
        tone: 'danger',
        title: this.i18n.translate('content.saveError'),
        message: this.i18n.translate('content.errorHint'),
      });
    } finally {
      this.busy.set(false);
    }
  }

  private text(value: string): string {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : '—';
  }

  private plainText(value: string): string {
    return value
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private formatTimestamp(value: string | null): string {
    if (!value) {
      return '';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    return new Intl.DateTimeFormat(this.i18n.getActiveLang(), {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  }
}
