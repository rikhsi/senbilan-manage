import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { AppBadgeComponent } from '../badge/app-badge.component';
import { AppButtonComponent } from '../button/app-button.component';
import { AppIconButtonComponent } from '../button/app-icon-button.component';
import { type ListFiltersLabels } from './list-filters.types';

/**
 * Shared list toolbar + filter drawer shell (Google / Yandex admin pattern).
 *
 * Toolbar stays compact: search on the left, “Filters” opens a side drawer
 * (bottom sheet on small screens). Filter fields are projected via `[filters]`;
 * applied chips via `[chips]`; optional end actions via `[end]`.
 *
 * ```html
 * <app-list-filters
 *   [(open)]="filtersOpen"
 *   [activeCount]="drawerFilterCount()"
 *   [labels]="filterLabels()"
 *   (apply)="applyFilters()"
 *   (reset)="resetFilters()"
 * >
 *   <app-search-input search mode="submit" … />
 *   <div filters>…fields bound to draft…</div>
 *   <div chips>…removable tags for applied filters…</div>
 * </app-list-filters>
 * ```
 */
@Component({
  selector: 'app-list-filters',
  imports: [AppBadgeComponent, AppButtonComponent, AppIconButtonComponent],
  templateUrl: './app-list-filters.component.html',
  styleUrl: './app-list-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-list-filters',
    '[class.app-list-filters--open]': 'open()',
  },
})
export class AppListFiltersComponent {
  readonly open = model(false);
  /** Count shown on the Filters button (drawer filters only — usually exclude search `q`). */
  readonly activeCount = input(0);
  readonly labels = input.required<ListFiltersLabels>();
  readonly apply = output<void>();
  readonly reset = output<void>();

  protected openPanel(): void {
    this.open.set(true);
  }

  protected closePanel(): void {
    this.open.set(false);
  }

  protected onApply(): void {
    this.apply.emit();
    this.open.set(false);
  }

  protected onReset(): void {
    this.reset.emit();
  }
}
