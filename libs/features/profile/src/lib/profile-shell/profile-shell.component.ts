import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { AppIconComponent } from '@senbilan/design-system/icons';
import { AppButtonComponent, AppConfirmDialogService } from '@senbilan/design-system/ui';
import { AuthStore } from '@senbilan/shared/auth';
import { PROFILE_NAV_ITEMS } from './profile.model';

@Component({
  selector: 'profile-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TranslocoPipe,
    AppIconComponent,
    AppButtonComponent,
  ],
  templateUrl: './profile-shell.component.html',
  styleUrl: './profile-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileShellComponent {
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly i18n = inject(TranslocoService);
  private readonly confirm = inject(AppConfirmDialogService);

  protected readonly navItems = PROFILE_NAV_ITEMS;

  protected async onLogout(): Promise<void> {
    const ok = await this.confirm.ask({
      title: this.i18n.translate('profile.logoutConfirmTitle'),
      message: this.i18n.translate('profile.logoutConfirmMessage'),
      confirmLabel: this.i18n.translate('profile.logout'),
      cancelLabel: this.i18n.translate('common.cancel'),
      tone: 'danger',
      icon: 'log-out',
    });
    if (!ok) {
      return;
    }
    await this.auth.logout();
    void this.router.navigateByUrl('/auth/login');
  }
}
