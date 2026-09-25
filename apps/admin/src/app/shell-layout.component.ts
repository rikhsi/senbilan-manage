import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AppShellComponent, type NavigationItem } from '@senbilan/design-system/layout';
import { AppToastContainerComponent } from '@senbilan/design-system/ui';
import { AuthStore } from '@senbilan/shared/auth';

/** Authenticated application chrome. Nav is permission-filtered via AuthStore. */
@Component({
  selector: 'admin-shell-layout',
  imports: [AppShellComponent, AppToastContainerComponent],
  template: `
    <app-shell
      [navItems]="navItems()"
      (notifications)="go('/notifications')"
      (profile)="go('/profile')"
      (settings)="go('/settings')"
      (logout)="onLogout()"
    />
    <app-toast-container />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellLayoutComponent {
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  private readonly allNav: readonly NavigationItem[] = [
    {
      id: 'dashboard',
      labelKey: 'nav.dashboard',
      route: '/dashboard',
      icon: 'layout-dashboard',
      permission: 'dashboard:read',
      exact: true,
    },
    {
      id: 'users',
      labelKey: 'nav.users',
      route: '/users',
      icon: 'users',
      permission: 'users:read',
    },
    {
      id: 'roles',
      labelKey: 'nav.roles',
      route: '/roles',
      icon: 'shield',
      permission: 'roles:read',
    },
    {
      id: 'permissions',
      labelKey: 'nav.permissions',
      route: '/permissions',
      icon: 'key',
      permission: 'permissions:read',
    },
    {
      id: 'notifications',
      labelKey: 'nav.notifications',
      route: '/notifications',
      icon: 'bell',
      permission: 'notifications:read',
    },
    {
      id: 'settings',
      labelKey: 'nav.settings',
      route: '/settings',
      icon: 'settings',
      permission: 'settings:read',
    },
  ];

  protected readonly navItems = computed(() =>
    this.allNav.filter((item) => !item.permission || this.auth.can(item.permission)),
  );

  protected go(path: string): void {
    void this.router.navigateByUrl(path);
  }

  protected async onLogout(): Promise<void> {
    await this.auth.logout();
    void this.router.navigateByUrl('/auth/login');
  }
}
