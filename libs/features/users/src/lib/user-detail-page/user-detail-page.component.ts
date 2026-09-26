import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { AdminCatalogRepository, type AdminUserDetailSnapshot } from '@senbilan/core/application';
import {
  AppButtonComponent,
  AppConfirmDialogService,
  AppEmptyStateComponent,
  AppStatusComponent,
  ToastService,
} from '@senbilan/design-system/ui';
import { PageTitleService } from '@senbilan/shared/i18n';

@Component({
  selector: 'user-detail-page',
  imports: [
    RouterLink,
    TranslocoPipe,
    AppButtonComponent,
    AppEmptyStateComponent,
    AppStatusComponent,
  ],
  templateUrl: './user-detail-page.component.html',
  styleUrl: './user-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailPageComponent {
  private readonly catalog = inject(AdminCatalogRepository);
  private readonly i18n = inject(TranslocoService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(AppConfirmDialogService);
  private readonly pageTitle = inject(PageTitleService);
  private readonly destroyRef = inject(DestroyRef);

  /** Bound from route `:id` via withComponentInputBinding. */
  readonly id = input.required<string>();

  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly detail = signal<AdminUserDetailSnapshot | null>(null);
  protected readonly busy = signal(false);

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
    try {
      const detail = await this.catalog.getUser(this.id());
      this.detail.set(detail);
      const label =
        detail.user.name ||
        detail.user.email ||
        detail.user.id ||
        this.i18n.translate('users.detailTitle');
      this.pageTitle.setDynamic(label);
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

  protected async block(): Promise<void> {
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
    await this.runAction(() => this.catalog.unblockUser(this.id()), 'users.unblocked');
  }

  protected async remove(): Promise<void> {
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
