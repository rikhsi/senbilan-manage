import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { AppIconComponent } from '@senbilan/design-system/icons';
import { AppPaginationMenuComponent } from './app-pagination-menu.component';
import { type CursorPaginationLabels } from './pagination.types';

export type { CursorPaginationLabels } from './pagination.types';

/**
 * Previous / next, a page picker, and a page size for cursor APIs that do not
 * return a total. The picker lists every page whose cursor is already known.
 */
@Component({
  selector: 'app-cursor-pagination',
  imports: [AppIconComponent, AppPaginationMenuComponent],
  template: `
    <div class="app-pagination__summary">
      <span class="app-pagination__size-label">{{ labels().page }}</span>
      <app-pagination-menu
        [label]="labels().page"
        [value]="page()"
        [options]="pageOptions()"
        [disabled]="disabled()"
        (valueChange)="pageChange.emit($event)"
      />
    </div>

    <div class="app-pagination__size">
      <span class="app-pagination__size-label">{{ labels().pageSize }}</span>
      <app-pagination-menu
        [label]="labels().pageSize"
        [value]="pageSize()"
        [options]="pageSizeOptions()"
        [disabled]="disabled()"
        (valueChange)="pageSizeChange.emit($event)"
      />
    </div>

    <nav class="app-pagination__pages" [attr.aria-label]="ariaLabel() || null">
      <button
        type="button"
        class="app-pagination__nav"
        [attr.aria-label]="labels().previous"
        [disabled]="disabled() || !hasPrevious()"
        (click)="previous.emit()"
      >
        <app-icon name="chevron-left" size="sm" />
      </button>
      <button
        type="button"
        class="app-pagination__nav"
        [attr.aria-label]="labels().next"
        [disabled]="disabled() || !hasNext()"
        (click)="next.emit()"
      >
        <app-icon name="chevron-right" size="sm" />
      </button>
    </nav>
  `,
  styleUrl: './app-pagination.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-pagination' },
})
export class AppCursorPaginationComponent {
  readonly page = input(1);
  /** How many pages already have a cursor, including the next page when it exists. */
  readonly pageCount = input(1);
  readonly pageSize = input(20);
  readonly pageSizeOptions = input<readonly number[]>([10, 20, 50]);
  readonly hasPrevious = input(false);
  readonly hasNext = input(false);
  readonly disabled = input(false);
  readonly labels = input.required<CursorPaginationLabels>();
  readonly ariaLabel = input('');

  readonly previous = output<void>();
  readonly next = output<void>();
  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();

  protected readonly pageOptions = computed(() => {
    const count = Math.max(this.pageCount(), this.page(), 1);
    return Array.from({ length: count }, (_, index) => index + 1);
  });
}
