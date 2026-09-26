import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { AppAvatarComponent, AppIconButtonComponent } from '@senbilan/design-system/ui';
import { AppBreadcrumbsComponent } from '../breadcrumbs/app-breadcrumbs.component';
import { LAYOUT_USER } from '../layout-bridges';
import { type BreadcrumbItem } from '../navigation.types';

@Component({
  selector: 'app-header',
  imports: [
    TranslocoDirective,
    AppIconButtonComponent,
    AppAvatarComponent,
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
            icon="bell"
            [label]="t('common.notifications')"
            (click)="notifications.emit()"
          ></button>

          <button
            type="button"
            class="app-header__user"
            [attr.aria-label]="t('common.profile')"
            (click)="profile.emit()"
          >
            <app-avatar [name]="userName()" [src]="userAvatar()" size="sm" ring="primary" />
          </button>
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

  readonly breadcrumbs = input<readonly BreadcrumbItem[]>([]);
  readonly showMenuToggle = input(false);
  readonly showCollapseToggle = input(true);
  readonly sidebarCollapsed = input(false);
  /** Optional override when the host prefers inputs over `LAYOUT_USER`. */
  readonly userDisplayName = input<string | null>(null);
  readonly userAvatarUrl = input<string | null>(null);

  readonly menuToggle = output<void>();
  readonly collapseToggle = output<void>();
  readonly notifications = output<void>();
  readonly profile = output<void>();

  protected readonly userName = computed(() => {
    const fromInput = this.userDisplayName();
    if (fromInput !== null && fromInput.length > 0) {
      return fromInput;
    }
    return this.userBridge?.user()?.displayName ?? '';
  });

  protected readonly userAvatar = computed(
    () => this.userAvatarUrl() ?? this.userBridge?.user()?.avatarUrl ?? null,
  );
}
