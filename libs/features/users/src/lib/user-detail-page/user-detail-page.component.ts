import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { AdminCatalogRepository, type AdminUserDetailSnapshot } from '@senbilan/core/application';
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
import { AuthStore } from '@senbilan/shared/auth';
import {
  injectTranslocoReady,
  PageTitleService,
  readLoadedTranslation,
} from '@senbilan/shared/i18n';
import {
  isUserBlocked,
  isUserDeleted,
  userPlanLabelKey,
  userRoleLabelKey,
  userStatusLabelKey,
} from '../users-page/users-page.model';

@Component({
  selector: 'user-detail-page',
  imports: [
    TranslocoPipe,
    AppDetailPageComponent,
    AppDetailFieldsComponent,
    AppButtonComponent,
    AppEmptyStateComponent,
  ],
  templateUrl: './user-detail-page.component.html',
  styleUrl: './user-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailPageComponent {
  private readonly catalog = inject(AdminCatalogRepository);
  private readonly auth = inject(AuthStore);
  private readonly i18n = inject(TranslocoService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(AppConfirmDialogService);
  private readonly pageTitle = inject(PageTitleService);
  private readonly i18nReady = injectTranslocoReady();
  private readonly destroyRef = inject(DestroyRef);

  /** Bound from route `:id` via withComponentInputBinding. */
  readonly id = input.required<string>();

  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly detail = signal<AdminUserDetailSnapshot | null>(null);
  protected readonly busy = signal(false);

  protected readonly breadcrumbs = computed<readonly BreadcrumbItem[]>(() => {
    this.i18nReady();
    const data = this.detail();
    const current = data
      ? this.displayName(data.user.name)
      : readLoadedTranslation(this.i18n, 'users.detailTitle');
    return [
      { labelKey: 'nav.dashboard', route: '/dashboard' },
      { labelKey: 'nav.users', route: '/users' },
      { label: current },
    ];
  });

  /** The signed-in admin cannot block, unblock, or delete their own account. */
  protected readonly isSelf = computed(() => {
    const current = this.auth.user()?.id;
    const target = this.detail()?.user.id;
    if (!current || !target) {
      return false;
    }
    return String(current) === target;
  });

  protected readonly isDeleted = computed(() => isUserDeleted(this.detail()?.user.deletedAt));

  protected readonly showBlock = computed(() => {
    const user = this.detail()?.user;
    return !!user && !this.isDeleted() && !this.isSelf() && !isUserBlocked(user.status);
  });

  protected readonly showUnblock = computed(() => {
    const user = this.detail()?.user;
    return !!user && !this.isDeleted() && !this.isSelf() && isUserBlocked(user.status);
  });

  protected readonly showDelete = computed(() => {
    const user = this.detail()?.user;
    return !!user && !this.isDeleted() && !this.isSelf();
  });

  protected readonly fields = computed<readonly DetailField[]>(() => {
    this.i18nReady();
    const data = this.detail();
    if (!data) {
      return [];
    }
    const user = data.user;
    return [
      { label: this.i18n.translate('users.phone'), value: user.phone || '—' },
      { label: this.i18n.translate('users.email'), value: user.email || '—' },
      {
        label: this.i18n.translate('users.status'),
        value: user.status ? this.enumLabel(userStatusLabelKey(user.status)) : '—',
      },
      {
        label: this.i18n.translate('users.role'),
        value: user.role ? this.enumLabel(userRoleLabelKey(user.role)) : '—',
      },
      {
        label: this.i18n.translate('users.plan'),
        value: user.plan ? this.enumLabel(userPlanLabelKey(user.plan)) : '—',
      },
      { label: this.i18n.translate('users.sessions'), value: String(data.activeSessions) },
      { label: this.i18n.translate('users.devices'), value: String(data.pushDevices) },
      { label: this.i18n.translate('users.couple'), value: data.coupleId || '—' },
      { label: this.i18n.translate('users.id'), value: user.id || '—' },
    ];
  });

  constructor() {
    this.destroyRef.onDestroy(() => this.pageTitle.setDynamic(null));

    effect(() => {
      const userId = this.id();
      if (userId) {
        void this.reload();
      }
    });
  }

  protected async reload(): Promise<void> {
    this.loading.set(true);
    this.error.set(false);
    this.detail.set(null);
    try {
      const detail = await this.catalog.getUser(this.id());
      this.detail.set(detail);
      this.pageTitle.setDynamic(this.displayName(detail.user.name));
    } catch {
      this.detail.set(null);
      this.error.set(true);
      this.pageTitle.setDynamic(this.i18n.translate('users.detailTitle'));
      this.toast.show({
        tone: 'danger',
        title: this.i18n.translate('users.errorTitle'),
        message: this.i18n.translate('users.errorHint'),
      });
    } finally {
      this.loading.set(false);
    }
  }

  protected displayName(name: string): string {
    const trimmed = name.trim();
    return trimmed.length > 0 ? trimmed : this.i18n.translate('users.nameMissing');
  }

  private enumLabel(key: string): string {
    const label = this.i18n.translate(key);
    return label === key ? '—' : label;
  }

  protected async block(): Promise<void> {
    if (!this.showBlock()) {
      return;
    }
    const ok = await this.confirm.ask({
      title: this.i18n.translate('users.blockConfirmTitle'),
      message: this.i18n.translate('users.blockConfirmMessage'),
      confirmLabel: this.i18n.translate('users.block'),
      cancelLabel: this.i18n.translate('common.cancel'),
      tone: 'danger',
    });
    if (!ok) {
      return;
    }
    await this.runAction(() => this.catalog.blockUser(this.id()), 'users.blocked');
  }

  protected async unblock(): Promise<void> {
    if (!this.showUnblock()) {
      return;
    }
    await this.runAction(() => this.catalog.unblockUser(this.id()), 'users.unblocked');
  }

  protected async remove(): Promise<void> {
    if (!this.showDelete()) {
      return;
    }
    const ok = await this.confirm.ask({
      title: this.i18n.translate('users.deleteConfirmTitle'),
      message: this.i18n.translate('users.deleteConfirmMessage'),
      confirmLabel: this.i18n.translate('users.delete'),
      cancelLabel: this.i18n.translate('common.cancel'),
      tone: 'danger',
    });
    if (!ok) {
      return;
    }
    this.busy.set(true);
    try {
      await this.catalog.deleteUser(this.id());
      this.toast.show({
        tone: 'success',
        title: this.i18n.translate('users.deleted'),
      });
      // stay on page showing deleted state after reload
      await this.reload();
    } catch {
      this.toast.show({
        tone: 'danger',
        title: this.i18n.translate('users.errorTitle'),
        message: this.i18n.translate('users.errorHint'),
      });
    } finally {
      this.busy.set(false);
    }
  }

  private async runAction(action: () => Promise<unknown>, successKey: string): Promise<void> {
    this.busy.set(true);
    try {
      await action();
      this.toast.show({
        tone: 'success',
        title: this.i18n.translate(successKey),
      });
      await this.reload();
    } catch {
      this.toast.show({
        tone: 'danger',
        title: this.i18n.translate('users.errorTitle'),
        message: this.i18n.translate('users.errorHint'),
      });
    } finally {
      this.busy.set(false);
    }
  }
}
