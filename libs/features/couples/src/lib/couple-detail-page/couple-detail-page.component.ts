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
import { AdminCatalogRepository, type AdminCoupleDetailSnapshot } from '@senbilan/core/application';
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
import { coupleMemberPhone, coupleMemberTitle } from '../couple-member';

const COUNT_KEYS = [
  'events',
  'lists',
  'wishes',
  'goals',
  'album_photos',
  'documents',
  'letters',
  'messages',
  'cards',
  'contacts',
  'shelf_items',
] as const;

@Component({
  selector: 'couples-detail-page',
  imports: [
    TranslocoPipe,
    AppDetailPageComponent,
    AppDetailFieldsComponent,
    AppButtonComponent,
    AppEmptyStateComponent,
  ],
  templateUrl: './couple-detail-page.component.html',
  styleUrl: './couple-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoupleDetailPageComponent {
  private readonly catalog = inject(AdminCatalogRepository);
  private readonly i18n = inject(TranslocoService);
  private readonly i18nReady = injectTranslocoReady();
  private readonly confirm = inject(AppConfirmDialogService);
  private readonly toast = inject(ToastService);

  readonly id = input.required<string>();

  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly busy = signal(false);
  protected readonly detail = signal<AdminCoupleDetailSnapshot | null>(null);

  protected readonly breadcrumbs = computed<readonly BreadcrumbItem[]>(() => {
    this.i18nReady();
    const couple = this.detail()?.couple;
    const current = couple
      ? this.memberTitle(couple.creator)
      : readLoadedTranslation(this.i18n, 'couples.detailTitle');
    return [
      { labelKey: 'nav.dashboard', route: '/dashboard' },
      { labelKey: 'nav.couples', route: '/couples' },
      { label: current },
    ];
  });

  protected readonly fields = computed<readonly DetailField[]>(() => {
    this.i18nReady();
    const data = this.detail();
    if (!data) {
      return [];
    }
    const couple = data.couple;
    const creatorPhone = coupleMemberPhone(couple.creator);
    const partnerPhone = coupleMemberPhone(couple.partner);
    const base: DetailField[] = [
      { label: this.i18n.translate('couples.creator'), value: this.memberTitle(couple.creator) },
      ...(creatorPhone
        ? [{ label: this.i18n.translate('couples.phone'), value: creatorPhone }]
        : []),
      { label: this.i18n.translate('couples.partner'), value: this.memberTitle(couple.partner) },
      ...(partnerPhone
        ? [{ label: this.i18n.translate('couples.phone'), value: partnerPhone }]
        : []),
      { label: this.i18n.translate('couples.status'), value: couple.status || '—' },
      {
        label: this.i18n.translate('couples.createdAt'),
        value: this.formatTimestamp(couple.createdAt),
      },
      { label: this.i18n.translate('couples.id'), value: couple.id || '—' },
    ];
    const counts = COUNT_KEYS.map((key) => ({
      label: this.i18n.translate(`couples.counts.${key}`),
      value: String(data.counts[key] ?? 0),
    }));
    return [...base, ...counts];
  });

  constructor() {
    effect(() => {
      const coupleId = this.id();
      if (coupleId) {
        void this.reload();
      }
    });
  }

  protected async reload(): Promise<void> {
    this.loading.set(true);
    this.error.set(false);
    this.detail.set(null);
    try {
      this.detail.set(await this.catalog.getCouple(this.id()));
    } catch {
      this.detail.set(null);
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  protected async unpair(): Promise<void> {
    const ok = await this.confirm.ask({
      title: this.i18n.translate('couples.unpairConfirmTitle'),
      message: this.i18n.translate('couples.unpairConfirmMessage'),
      confirmLabel: this.i18n.translate('couples.unpair'),
      cancelLabel: this.i18n.translate('common.cancel'),
      tone: 'danger',
    });
    if (!ok) {
      return;
    }
    this.busy.set(true);
    try {
      await this.catalog.unpairCouple(this.id());
      this.toast.show({ tone: 'success', title: this.i18n.translate('couples.unpaired') });
      await this.reload();
    } catch {
      this.toast.show({
        tone: 'danger',
        title: this.i18n.translate('couples.errorTitle'),
        message: this.i18n.translate('couples.errorHint'),
      });
    } finally {
      this.busy.set(false);
    }
  }

  private memberTitle(member: AdminCoupleDetailSnapshot['couple']['creator']): string {
    return coupleMemberTitle(member, this.i18n.translate('couples.nameMissing'));
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
