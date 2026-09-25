import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AppButtonComponent } from '../button/app-button.component';

/**
 * Horizontal filter row: search on the left, filters, and a "reset" button that
 * appears when `activeCount > 0`. On mobile filters wrap into a 2-column grid.
 *
 * ```html
 * <app-filter-bar [activeCount]="filters.active()" [resetLabel]="t('common.reset')" (reset)="filters.reset()">
 *   <app-search-input search [placeholder]="t('users.search')" (search)="filters.setQuery($event)" />
 *   <app-select [options]="roles()" [labels]="selectLabels" [formControl]="role" />
 * </app-filter-bar>
 * ```
 */
@Component({
  selector: 'app-filter-bar',
  imports: [AppButtonComponent],
  template: `
    <div class="app-filter-bar__search"><ng-content select="[search]" /></div>
    <div class="app-filter-bar__filters"><ng-content /></div>
    @if (activeCount() > 0 && resetLabel()) {
      <button
        app-button
        variant="ghost"
        size="sm"
        icon="x"
        type="button"
        class="app-filter-bar__reset"
        (click)="reset.emit()"
      >
        {{ resetLabel() }} ({{ activeCount() }})
      </button>
    }
    <div class="app-filter-bar__end"><ng-content select="[end]" /></div>
  `,
  styleUrl: './app-filter-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-filter-bar' },
})
export class AppFilterBarComponent {
  readonly activeCount = input(0);
  readonly resetLabel = input('');
  readonly reset = output<void>();
}
