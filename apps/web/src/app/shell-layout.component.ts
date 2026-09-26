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
import { AppConfirmDialogService, AppModalService } from '@senbilan/design-system/ui';
import { openNotificationsInbox } from '@senbilan/features/notifications';
import { AuthStore } from '@senbilan/shared/auth';
import { CommandPaletteService, type Command } from '@senbilan/shared/command';
import { ShellStore } from '@senbilan/shared/shell';
import { ThemeService } from '@senbilan/shared/theme';
import { WEB_SHELL_ACTION_COMMANDS } from './shell-command.defs';
import { WEB_SHELL_NAV } from './shell-nav';

/** Authenticated application chrome. Nav is permission-filtered via AuthStore. */
@Component({
  selector: 'web-shell-layout',
  imports: [AppShellComponent],
  template: `
    <app-shell
      [navItems]="navItems()"
      [sidebarCollapsed]="shell.sidebarCollapsed()"
      (sidebarCollapsedChange)="shell.setSidebarCollapsed($event)"
      (notifications)="openNotifications()"
      (profile)="go('/profile')"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'web-shell-layout',
    '[attr.data-density]': 'shell.density()',
  },
  styles: `
    :host {
      display: block;
      min-height: 100%;
    }
  `,
})
export class ShellLayoutComponent implements OnInit {
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly i18n = inject(TranslocoService);
  private readonly palette = inject(CommandPaletteService);
  private readonly theme = inject(ThemeService);
  private readonly modal = inject(AppModalService);
  private readonly confirm = inject(AppConfirmDialogService);
  protected readonly shell = inject(ShellStore);

  protected readonly navItems = computed(() => this.filterNav(WEB_SHELL_NAV));

  ngOnInit(): void {
    const dispose = this.palette.registerMany(this.buildCommands());
    this.destroyRef.onDestroy(dispose);
  }

  protected go(path: string): void {
    void this.router.navigateByUrl(path);
  }

  protected openNotifications(): void {
    openNotificationsInbox(this.modal, this.i18n.translate('common.notifications'));
  }

  protected async onLogout(): Promise<void> {
    const ok = await this.confirm.ask({
      title: this.i18n.translate('common.logoutConfirmTitle'),
      message: this.i18n.translate('common.logoutConfirmMessage'),
      confirmLabel: this.i18n.translate('common.logout'),
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

  private buildCommands(): readonly Command[] {
    const navCommands: Command[] = WEB_SHELL_NAV.filter(
      (item): item is NavigationItem & { route: string } => item.route !== undefined,
    ).map((item) => {
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
        ...(item.permission !== undefined ? { permission: item.permission as PermissionKey } : {}),
      };
    });

    const actionCommands: Command[] = WEB_SHELL_ACTION_COMMANDS.map((def) => ({
      id: def.id,
      label: this.i18n.translate(def.labelKey),
      labelKey: def.labelKey,
      icon: def.icon,
      keywords: [...def.keywords],
      action: () => {
        if (def.kind === 'theme') {
          this.theme.cycleMode();
          return;
        }
        if (def.kind === 'logout') {
          void this.onLogout();
          return;
        }
        this.shell.closeCommandPalette();
        if (def.route !== undefined) {
          void this.router.navigateByUrl(def.route);
        }
      },
    }));

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
