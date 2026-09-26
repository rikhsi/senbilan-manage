import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AppBreadcrumbsComponent } from '../breadcrumbs/app-breadcrumbs.component';
import { type BreadcrumbItem } from '../navigation.types';

/**
 * Shared chrome for admin list/table screens (TezUp-style):
 * breadcrumbs (+ optional title/actions), then toolbar, then table body.
 * Prefer breadcrumbs alone when the current page label is already in the trail.
 */
@Component({
  selector: 'app-list-page',
  imports: [AppBreadcrumbsComponent],
  template: `
    <div class="app-list-page">
      <div class="app-list-page__top" [class.app-list-page__top--with-title]="!!title()">
        <div class="app-list-page__lead">
          @if (breadcrumbs().length) {
            <app-breadcrumbs [items]="breadcrumbs()" />
          }
          @if (title()) {
            <h1 class="app-list-page__title">{{ title() }}</h1>
          }
        </div>
        <div class="app-list-page__actions">
          <ng-content select="[actions]" />
        </div>
      </div>

      <div class="app-list-page__toolbar">
        <ng-content select="[toolbar]" />
      </div>

      <div class="app-list-page__body">
        <ng-content />
      </div>
    </div>
  `,
  styleUrl: './app-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-list-page-host' },
})
export class AppListPageComponent {
  readonly title = input('');
  readonly breadcrumbs = input<readonly BreadcrumbItem[]>([]);
}
