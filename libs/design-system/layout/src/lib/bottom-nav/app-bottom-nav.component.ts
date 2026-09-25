import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { type PermissionKey } from '@senbilan/core/domain';
import { AppIconComponent } from '@senbilan/design-system/icons';
import { AuthStore } from '@senbilan/shared/auth';
import { type NavigationItem } from '../navigation.types';

@Component({
  selector: 'app-bottom-nav',
  imports: [RouterLink, RouterLinkActive, AppIconComponent, TranslocoDirective],
  template: `
    <ng-container *transloco="let t">
      <nav class="app-bottom-nav" [attr.aria-label]="t('nav.menu')">
        @for (item of visibleItems(); track item.id) {
          @if (item.route; as route) {
            <a
              class="app-bottom-nav__link"
              [routerLink]="route"
              routerLinkActive="app-bottom-nav__link--active"
              [routerLinkActiveOptions]="{ exact: item.exact === true }"
            >
              @if (item.icon; as icon) {
                <app-icon [name]="icon" size="sm" />
              }
              <span class="app-bottom-nav__label">{{ t(item.labelKey) }}</span>
            </a>
          }
        }
      </nav>
    </ng-container>
  `,
  styleUrl: './app-bottom-nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-bottom-nav-host' },
})
export class AppBottomNavComponent {
  private readonly auth = inject(AuthStore, { optional: true });

  readonly items = input.required<readonly NavigationItem[]>();

  protected readonly visibleItems = computed(() =>
    this.items()
      .filter((item) => item.route !== undefined && this.canAccess(item.permission))
      .slice(0, 5),
  );

  private canAccess(permission: PermissionKey | undefined): boolean {
    if (permission === undefined) {
      return true;
    }
    return this.auth?.can(permission) ?? true;
  }
}
