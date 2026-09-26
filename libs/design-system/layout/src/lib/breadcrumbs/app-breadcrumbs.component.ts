import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { type BreadcrumbItem } from '../navigation.types';

@Component({
  selector: 'app-breadcrumbs',
  imports: [RouterLink, TranslocoDirective],
  template: `
    <ng-container *transloco="let t">
      <nav class="app-breadcrumbs" [attr.aria-label]="t('common.breadcrumbs')">
        @if (compact()) {
          <div class="app-breadcrumbs__compact">
            @if (parentLink(); as parent) {
              <a class="app-breadcrumbs__parent" [routerLink]="parent.route">
                {{ parent.label ?? (parent.labelKey ? t(parent.labelKey) : '') }}
              </a>
            }
            @if (currentItem(); as current) {
              <span class="app-breadcrumbs__current" aria-current="page">
                {{ current.label ?? (current.labelKey ? t(current.labelKey) : '') }}
              </span>
            }
          </div>
        } @else {
          <ol class="app-breadcrumbs__list">
            @for (item of items(); track $index; let last = $last) {
              <li class="app-breadcrumbs__item">
                @if (!last && item.route; as route) {
                  <a class="app-breadcrumbs__link" [routerLink]="route">
                    {{ item.label ?? (item.labelKey ? t(item.labelKey) : '') }}
                  </a>
                } @else {
                  <span class="app-breadcrumbs__current" [attr.aria-current]="last ? 'page' : null">
                    {{ item.label ?? (item.labelKey ? t(item.labelKey) : '') }}
                  </span>
                }
                @if (!last) {
                  <span class="app-breadcrumbs__sep" aria-hidden="true">/</span>
                }
              </li>
            }
          </ol>
        }
      </nav>
    </ng-container>
  `,
  styleUrl: './app-breadcrumbs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-breadcrumbs-host',
    '[class.app-breadcrumbs-host--compact]': 'compact()',
  },
})
export class AppBreadcrumbsComponent {
  readonly items = input.required<readonly BreadcrumbItem[]>();
  /**
   * Phone layout: parent section link + current page title (back lives on the sibling control).
   */
  readonly compact = input(false);

  protected readonly currentItem = computed(() => {
    const all = this.items();
    return all.length > 0 ? (all[all.length - 1] ?? null) : null;
  });

  /** Nearest ancestor with a route — shown above the title on compact layouts. */
  protected readonly parentLink = computed(() => {
    if (!this.compact()) {
      return null;
    }
    const all = this.items();
    for (let index = all.length - 2; index >= 0; index -= 1) {
      const item = all[index];
      if (item?.route) {
        return item;
      }
    }
    return null;
  });
}
