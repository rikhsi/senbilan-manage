import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  type OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { type PermissionKey } from '@senbilan/core/domain';
import { AppShellComponent, type NavigationItem } from '@senbilan/design-system/layout';
import { AppToastContainerComponent } from '@senbilan/design-system/ui';
import { AuthStore } from '@senbilan/shared/auth';
import { CommandPaletteService, type Command } from '@senbilan/shared/command';
import { ShellStore } from '@senbilan/shared/shell';
import { ThemeService } from '@senbilan/shared/theme';

/** Authenticated application chrome. Nav is permission-filtered via AuthStore. */
@Component({
  selector: 'admin-shell-layout',
  imports: [AppShellComponent, AppToastContainerComponent],
  template: `
    <app-shell
      [navItems]="navItems()"
      [sidebarCollapsed]="shell.sidebarCollapsed()"
      (sidebarCollapsedChange)="shell.setSidebarCollapsed($event)"
      (notifications)="go('/notifications')"
      (profile)="go('/profile')"
      (settings)="go('/settings')"
      (logout)="onLogout()"
    />
    <app-toast-container />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'admin-shell-layout',
    '[attr.data-density]': 'shell.density()',
  },
})
export class ShellLayoutComponent implements OnInit {
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly i18n = inject(TranslocoService);
  private readonly palette = inject(CommandPaletteService);
  private readonly theme = inject(ThemeService);
  protected readonly shell = inject(ShellStore);

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

  protected readonly navItems = computed(() => this.filterNav(this.allNav));

  ngOnInit(): void {
    const dispose = this.palette.registerMany(this.buildCommands());
    this.destroyRef.onDestroy(dispose);
  }

  protected go(path: string): void {
    void this.router.navigateByUrl(path);
  }

  protected async onLogout(): Promise<void> {
    await this.auth.logout();
    void this.router.navigateByUrl('/auth/login');
  }

  private buildCommands(): readonly Command[] {
    const navCommands: Command[] = this.allNav
      .filter((item): item is NavigationItem & { route: string } => item.route !== undefined)
      .map((item) => {
        const base = {
          id: `nav.${item.id}`,
          label: this.i18n.translate(item.labelKey),
          labelKey: item.labelKey,
          keywords: [item.id, item.route],
          action: () => {
            this.shell.closeCommandPalette();
            void this.router.navigateByUrl(item.route);
          },
        };
        return {
          ...base,
          ...(item.icon !== undefined ? { icon: item.icon } : {}),
          ...(item.permission !== undefined
            ? { permission: item.permission as PermissionKey }
            : {}),
        };
      });

    const actionCommands: Command[] = [
      {
        id: 'action.profile',
        label: this.i18n.translate('common.profile'),
        labelKey: 'common.profile',
        icon: 'user',
        keywords: ['account', 'me'],
        action: () => {
          this.shell.closeCommandPalette();
          void this.router.navigateByUrl('/profile');
        },
      },
      {
        id: 'action.theme',
        label: this.i18n.translate('common.cycleTheme'),
        labelKey: 'common.cycleTheme',
        icon: 'sun',
        keywords: ['dark', 'light', 'theme'],
        action: () => this.theme.cycleMode(),
      },
      {
        id: 'action.logout',
        label: this.i18n.translate('common.logout'),
        labelKey: 'common.logout',
        icon: 'log-out',
        keywords: ['sign out', 'exit'],
        action: () => void this.onLogout(),
      },
    ];

    return [...navCommands, ...actionCommands];
  }

  private filterNav(items: readonly NavigationItem[]): NavigationItem[] {
    return items
      .filter((item) => this.canAccess(item.permission))
      .map((item) => {
        if (!item.children?.length) {
          return item;
        }
        const children = this.filterNav(item.children);
        return { ...item, children };
      })
      .filter((item) => item.route !== undefined || (item.children?.length ?? 0) > 0);
  }

  private canAccess(permission: string | undefined): boolean {
    if (permission === undefined) {
      return true;
    }
    return this.auth.can(permission as PermissionKey);
  }
}
