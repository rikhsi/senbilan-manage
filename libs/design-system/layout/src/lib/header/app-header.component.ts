import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import {
  AppAvatarComponent,
  AppIconButtonComponent,
  AppMenuComponent,
  AppMenuDividerComponent,
  AppMenuItemComponent,
  AppMenuTriggerDirective,
} from '@senbilan/design-system/ui';
import { AppBreadcrumbsComponent } from '../breadcrumbs/app-breadcrumbs.component';
import { LAYOUT_THEME, LAYOUT_USER, type LayoutThemeMode } from '../layout-bridges';
import { type BreadcrumbItem } from '../navigation.types';

@Component({
  selector: 'app-header',
  imports: [
    TranslocoDirective,
    AppIconButtonComponent,
    AppAvatarComponent,
    AppMenuComponent,
    AppMenuItemComponent,
    AppMenuDividerComponent,
    AppMenuTriggerDirective,
    AppBreadcrumbsComponent,
  ],
  template: `
    <ng-container *transloco="let t">
      <header class="app-header">
        <div class="app-header__start">
          @if (showMenuToggle()) {
            <button
              app-icon-button
              type="button"
              icon="menu"
              [label]="t('nav.openMenu')"
              (click)="menuToggle.emit()"
            ></button>
          }
          @if (showCollapseToggle()) {
            <button
              app-icon-button
              type="button"
              [icon]="sidebarCollapsed() ? 'panel-left-open' : 'panel-left-close'"
              [label]="sidebarCollapsed() ? t('nav.expand') : t('nav.collapse')"
              (click)="collapseToggle.emit()"
            ></button>
          }
          <div class="app-header__breadcrumbs">
            @if (breadcrumbs().length) {
              <app-breadcrumbs [items]="breadcrumbs()" />
            }
            <ng-content select="[breadcrumbs]" />
          </div>
        </div>

        <div class="app-header__end">
          <button
            app-icon-button
            type="button"
            icon="search"
            [label]="t('common.search')"
            (click)="search.emit()"
          ></button>

          <button
            app-icon-button
            type="button"
            icon="bell"
            [label]="t('common.notifications')"
            (click)="notifications.emit()"
          ></button>

          <button
            app-icon-button
            type="button"
            [icon]="themeIcon()"
            [label]="t('common.theme')"
            (click)="cycleTheme()"
          ></button>

          <button
            app-icon-button
            type="button"
            icon="globe"
            [label]="t('common.language')"
            (click)="cycleLanguage()"
          ></button>

          <button
            type="button"
            class="app-header__user"
            [appMenuTriggerFor]="userMenu"
            [attr.aria-label]="t('common.profile')"
          >
            <app-avatar [name]="userName()" [src]="userAvatar()" size="sm" ring="primary" />
          </button>

          <ng-template #userMenu>
            <app-menu [ariaLabel]="t('common.actions')">
              <button appMenuItem icon="user" type="button" (click)="profile.emit()">
                {{ t('common.profile') }}
              </button>
              <button appMenuItem icon="settings" type="button" (click)="settings.emit()">
                {{ t('common.settings') }}
              </button>
              <app-menu-divider />
              <button
                appMenuItem
                icon="log-out"
                type="button"
                tone="danger"
                (click)="logout.emit()"
              >
                {{ t('common.logout') }}
              </button>
            </app-menu>
          </ng-template>
        </div>
      </header>
    </ng-container>
  `,
  styleUrl: './app-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-header-host' },
})
export class AppHeaderComponent {
  private readonly userBridge = inject(LAYOUT_USER, { optional: true });
  private readonly themeBridge = inject(LAYOUT_THEME, { optional: true });
  private readonly transloco = inject(TranslocoService, { optional: true });

  readonly breadcrumbs = input<readonly BreadcrumbItem[]>([]);
  readonly showMenuToggle = input(false);
  readonly showCollapseToggle = input(true);
  readonly sidebarCollapsed = input(false);
  /** Optional override when the host prefers inputs over `LAYOUT_USER`. */
  readonly userDisplayName = input<string | null>(null);
  readonly userAvatarUrl = input<string | null>(null);

  readonly menuToggle = output<void>();
  readonly collapseToggle = output<void>();
  readonly search = output<void>();
  readonly notifications = output<void>();
  readonly profile = output<void>();
  readonly settings = output<void>();
  readonly logout = output<void>();

  protected readonly userName = computed(() => {
    const fromInput = this.userDisplayName();
    if (fromInput !== null && fromInput.length > 0) {
      return fromInput;
    }
    return this.userBridge?.user()?.displayName ?? 'User';
  });

  protected readonly userAvatar = computed(
    () => this.userAvatarUrl() ?? this.userBridge?.user()?.avatarUrl ?? null,
  );

  protected readonly themeIcon = computed(() => {
    const mode: LayoutThemeMode = this.themeBridge?.mode() ?? 'system';
    if (mode === 'dark') {
      return 'moon';
    }
    if (mode === 'light') {
      return 'sun';
    }
    return 'monitor';
  });

  protected cycleTheme(): void {
    this.themeBridge?.cycleMode();
  }

  protected cycleLanguage(): void {
    if (!this.transloco) {
      return;
    }
    const langs = (this.transloco.getAvailableLangs() as (string | { id: string })[]).map((lang) =>
      typeof lang === 'string' ? lang : lang.id,
    );
    if (langs.length === 0) {
      return;
    }
    const active = this.transloco.getActiveLang();
    const index = langs.indexOf(active);
    const next = langs[(index + 1) % langs.length] ?? langs[0];
    if (next) {
      this.transloco.setActiveLang(next);
    }
  }
}
