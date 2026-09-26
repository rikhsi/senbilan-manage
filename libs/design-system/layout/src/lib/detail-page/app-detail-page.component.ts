import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { AppButtonComponent, ViewportService } from '@senbilan/design-system/ui';
import { AppBreadcrumbsComponent } from '../breadcrumbs/app-breadcrumbs.component';
import { type BreadcrumbItem } from '../navigation.types';

/**
 * Shared chrome for admin detail screens.
 * Same row as list pages: breadcrumbs and actions, then the body.
 * The current record name belongs in the breadcrumb trail, not in a subtitle.
 */
@Component({
  selector: 'app-detail-page',
  imports: [AppBreadcrumbsComponent, AppButtonComponent, RouterLink, TranslocoDirective],
  template: `
    <div class="app-detail-page">
      <div class="app-detail-page__top" [class.app-detail-page__top--compact]="compactNav()">
        <div class="app-detail-page__lead">
          <div class="app-detail-page__nav">
            <ng-container *transloco="let t">
              @if (backRoute(); as route) {
                <a
                  app-button
                  variant="secondary"
                  size="md"
                  icon="arrow-left"
                  [iconOnly]="compactNav()"
                  [attr.aria-label]="t('common.back')"
                  [routerLink]="route"
                >
                  @if (!compactNav()) {
                    {{ t('common.back') }}
                  }
                </a>
              }
            </ng-container>
            @if (breadcrumbs().length) {
              <app-breadcrumbs [items]="breadcrumbs()" [compact]="compactNav()" />
            }
          </div>
        </div>
        <div class="app-detail-page__actions">
          <ng-content select="[actions]" />
        </div>
      </div>

      <div class="app-detail-page__body">
        <ng-content />
      </div>
    </div>
  `,
  styleUrl: './app-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-detail-page-host' },
})
export class AppDetailPageComponent {
  private readonly viewport = inject(ViewportService);

  readonly breadcrumbs = input<readonly BreadcrumbItem[]>([]);

  /** Icon-only back + compact crumb trail on phone widths. */
  protected readonly compactNav = computed(() => this.viewport.isMobile());

  /** List route sitting above the current record. Top-level pages have no back target. */
  protected readonly backRoute = computed(() => {
    const items = this.breadcrumbs();
    if (items.length < 2) {
      return null;
    }
    const current = items[items.length - 1];
    if (current?.route) {
      return null;
    }
    for (let index = items.length - 2; index >= 0; index -= 1) {
      const route = items[index]?.route;
      if (route) {
        return route;
      }
    }
    return null;
  });
}
