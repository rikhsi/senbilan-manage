import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { type BreadcrumbItem } from '../navigation.types';

@Component({
  selector: 'app-breadcrumbs',
  imports: [RouterLink, TranslocoDirective],
  template: `
    <ng-container *transloco="let t">
      <nav class="app-breadcrumbs" [attr.aria-label]="t('common.breadcrumbs')">
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
      </nav>
    </ng-container>
  `,
  styleUrl: './app-breadcrumbs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-breadcrumbs-host' },
})
export class AppBreadcrumbsComponent {
  readonly items = input.required<readonly BreadcrumbItem[]>();
}
