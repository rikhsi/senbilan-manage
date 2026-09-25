import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { AppIconComponent } from '@senbilan/design-system/icons';
import { AppInputDirective } from '../form/app-input.directive';

export interface PaginationLabels {
  readonly previous: string;
  readonly next: string;
  readonly first: string;
  readonly last: string;
  readonly pageSize: string;
  /** e.g. "{{from}}–{{to}} of {{total}}" already interpolated by the caller. */
  readonly summary: string;
}

/**
 * Server-side friendly pagination: emits page and page-size changes, renders a
 * compact control set on mobile (prev/next + summary) and full pages on desktop.
 */
@Component({
  selector: 'app-pagination',
  imports: [AppIconComponent, AppInputDirective],
  template: `
    <div class="app-pagination__summary">{{ labels().summary }}</div>

    <div class="app-pagination__size">
      <label class="app-pagination__size-label" [attr.for]="sizeId">{{ labels().pageSize }}</label>
      <select
        appInput
        [id]="sizeId"
        class="app-pagination__size-select"
        [value]="pageSize()"
        (change)="onSizeChange($event)"
      >
        @for (option of pageSizeOptions(); track option) {
          <option [value]="option" [selected]="option === pageSize()">{{ option }}</option>
        }
      </select>
    </div>

    <nav class="app-pagination__pages" [attr.aria-label]="ariaLabel() || null">
      <button
        type="button"
        class="app-pagination__nav"
        [attr.aria-label]="labels().first"
        [disabled]="page() <= 1"
        (click)="go(1)"
      >
        <app-icon name="chevrons-left" size="sm" />
      </button>
      <button
        type="button"
        class="app-pagination__nav"
        [attr.aria-label]="labels().previous"
        [disabled]="page() <= 1"
        (click)="go(page() - 1)"
      >
        <app-icon name="chevron-left" size="sm" />
      </button>

      @for (item of items(); track $index) {
        @if (item === null) {
          <span class="app-pagination__ellipsis" aria-hidden="true">…</span>
        } @else {
          <button
            type="button"
            class="app-pagination__page"
            [class.app-pagination__page--current]="item === page()"
            [attr.aria-current]="item === page() ? 'page' : null"
            (click)="go(item)"
          >
            {{ item }}
          </button>
        }
      }

      <button
        type="button"
        class="app-pagination__nav"
        [attr.aria-label]="labels().next"
        [disabled]="page() >= pages()"
        (click)="go(page() + 1)"
      >
        <app-icon name="chevron-right" size="sm" />
      </button>
      <button
        type="button"
        class="app-pagination__nav"
        [attr.aria-label]="labels().last"
        [disabled]="page() >= pages()"
        (click)="go(pages())"
      >
        <app-icon name="chevrons-right" size="sm" />
      </button>
    </nav>
  `,
  styleUrl: './app-pagination.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-pagination' },
})
export class AppPaginationComponent {
  private static counter = 0;

  readonly page = model(1);
  readonly pageSize = model(20);
  readonly total = input.required<number>();
  readonly pageSizeOptions = input<readonly number[]>([10, 20, 50, 100]);
  readonly labels = input.required<PaginationLabels>();
  readonly ariaLabel = input('');

  protected readonly sizeId = `app-pagination-size-${AppPaginationComponent.counter++}`;

  readonly pages = computed(() =>
    Math.max(1, Math.ceil(this.total() / Math.max(1, this.pageSize()))),
  );

  /** Page numbers with ellipses (null) — current ±1, first and last. */
  protected readonly items = computed<readonly (number | null)[]>(() => {
    const pages = this.pages();
    const current = this.page();
    if (pages <= 7) {
      return Array.from({ length: pages }, (_, index) => index + 1);
    }
    const set = new Set<number>([1, pages, current - 1, current, current + 1]);
    if (current <= 3) {
      [2, 3, 4].forEach((p) => set.add(p));
    }
    if (current >= pages - 2) {
      [pages - 3, pages - 2, pages - 1].forEach((p) => set.add(p));
    }
    const sorted = [...set].filter((p) => p >= 1 && p <= pages).sort((a, b) => a - b);
    const result: (number | null)[] = [];
    sorted.forEach((p, index) => {
      const previous = sorted[index - 1];
      if (previous !== undefined && p - previous > 1) {
        result.push(null);
      }
      result.push(p);
    });
    return result;
  });

  protected go(target: number): void {
    const clamped = Math.min(this.pages(), Math.max(1, target));
    if (clamped !== this.page()) {
      this.page.set(clamped);
    }
  }

  protected onSizeChange(event: Event): void {
    const size = Number((event.target as HTMLSelectElement).value);
    this.pageSize.set(size);
    this.page.set(1);
  }
}
