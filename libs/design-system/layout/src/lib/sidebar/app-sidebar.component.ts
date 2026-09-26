import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { AppIconComponent } from '@senbilan/design-system/icons';
import { LAYOUT_CAN_ACCESS } from '../layout-bridges';
import { type NavigationItem } from '../navigation.types';
import { SIDEBAR_BRAND_LOGO_SRC } from './sidebar.brand';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, AppIconComponent, TranslocoDirective, NgTemplateOutlet],
  template: `
    <ng-container *transloco="let t">
      <aside class="app-sidebar" [class.app-sidebar--collapsed]="collapsed()">
        <div class="app-sidebar__brand" [attr.aria-label]="t('app.brand')">
          <img
            class="app-sidebar__brand-logo"
            [src]="logoSrc"
            alt=""
            width="32"
            height="32"
            decoding="async"
          />
          <span class="app-sidebar__brand-name" aria-hidden="true">{{ t('app.brand') }}</span>
        </div>

        <nav class="app-sidebar__nav" [attr.aria-label]="t('nav.menu')">
          <ng-container
            *ngTemplateOutlet="navList; context: { $implicit: visibleItems(), depth: 0 }"
          />
        </nav>

        <ng-content select="[sidebarFooter]" />
      </aside>

      <ng-template #navList let-items let-depth="depth">
        <ul class="app-sidebar__list" [attr.data-depth]="depth" role="list">
          @for (item of items; track item.id) {
            <li class="app-sidebar__item">
              @if (item.route; as route) {
                <a
                  class="app-sidebar__link"
                  [routerLink]="route"
                  routerLinkActive="app-sidebar__link--active"
                  [routerLinkActiveOptions]="{ exact: item.exact === true }"
                  [attr.title]="collapsed() ? t(item.labelKey) : null"
                >
                  @if (item.icon; as icon) {
                    <app-icon class="app-sidebar__icon" [name]="icon" size="sm" />
                  }
                  <span class="app-sidebar__label">{{ t(item.labelKey) }}</span>
                </a>
              } @else {
                <div class="app-sidebar__group-label">{{ t(item.labelKey) }}</div>
              }
              @if (item.children?.length) {
                <div class="app-sidebar__children">
                  <ng-container
                    *ngTemplateOutlet="
                      navList;
                      context: { $implicit: filterItems(item.children ?? []), depth: depth + 1 }
                    "
                  />
                </div>
              }
            </li>
          }
        </ul>
      </ng-template>
    </ng-container>
  `,
  styleUrl: './app-sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-sidebar-host',
    '[class.app-sidebar-host--collapsed]': 'collapsed()',
  },
})
export class AppSidebarComponent {
  private readonly canAccessFn = inject(LAYOUT_CAN_ACCESS, { optional: true });

  protected readonly logoSrc = SIDEBAR_BRAND_LOGO_SRC;

  readonly items = input.required<readonly NavigationItem[]>();
  readonly collapsed = input(false);

  protected readonly visibleItems = computed(() => this.filterItems(this.items()));

  protected filterItems(items: readonly NavigationItem[]): NavigationItem[] {
    return items
      .filter((item) => this.canAccess(item.permission))
      .map((item) => {
        if (!item.children?.length) {
          return item;
        }
        const children = this.filterItems(item.children);
        return { ...item, children };
      })
      .filter((item) => item.route !== undefined || (item.children?.length ?? 0) > 0);
  }

  private canAccess(permission: string | undefined): boolean {
    if (permission === undefined || !this.canAccessFn) {
      return true;
    }
    return this.canAccessFn(permission);
  }
}
