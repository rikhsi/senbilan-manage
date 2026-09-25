import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  contentChildren,
  DestroyRef,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { AppIconComponent } from '@senbilan/design-system/icons';
import { AppButtonComponent } from '../button/app-button.component';
import { AppIconButtonComponent } from '../button/app-icon-button.component';
import { AppCheckboxComponent } from '../form/app-checkbox.component';
import { AppMenuComponent, AppMenuTriggerDirective } from '../menu/app-menu.component';
import { AppSkeletonComponent } from '../skeleton/app-skeleton.component';
import { AppEmptyStateComponent } from '../states/app-empty-state.component';
import { AppErrorStateComponent } from '../states/app-error-state.component';
import { ViewportService } from '../viewport/viewport.service';
import {
  AppCellDirective,
  AppRowActionsDirective,
  AppRowExpansionDirective,
} from './data-table.directives';
import {
  type CellTemplate,
  type ColumnDef,
  compareValues,
  type DataTableLabels,
  nextSort,
  type SortState,
} from './data-table.types';

export type DataTableMode = 'auto' | 'table' | 'cards';

/**
 * Data table for admin screens.
 *  - sorting (client or server via `sort` model), column visibility & resizing,
 *    row selection with bulk toolbar, expandable rows, sticky header, density via tokens
 *  - mobile card mode (`mode="auto"` switches below `md`)
 *  - loading skeletons, error and empty states built in
 * Server-side: bind `[rows]` to the current page, `[(sort)]` to your query params and
 * render `<app-pagination>` below. Keep filtering UI outside (FilterBar) — the table
 * only shows what it is given.
 */
@Component({
  selector: 'app-data-table',
  imports: [
    NgTemplateOutlet,
    AppIconComponent,
    AppButtonComponent,
    AppIconButtonComponent,
    AppCheckboxComponent,
    AppSkeletonComponent,
    AppEmptyStateComponent,
    AppErrorStateComponent,
    AppMenuComponent,
    AppMenuTriggerDirective,
  ],
  templateUrl: './app-data-table.component.html',
  styleUrl: './app-data-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-data-table',
    '[attr.data-mode]': 'effectiveMode()',
    '[class.app-data-table--resizing]': 'resizing() !== null',
  },
})
export class AppDataTableComponent<T> {
  private readonly viewport = inject(ViewportService);
  private readonly destroyRef = inject(DestroyRef);

  readonly rows = input.required<readonly T[]>();
  readonly columns = input.required<readonly ColumnDef<T>[]>();
  readonly rowId = input.required<(row: T) => string>();
  readonly labels = input.required<DataTableLabels>();
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly selectable = input(false);
  readonly resizable = input(true);
  readonly stickyHeader = input(true);
  readonly columnPicker = input(true);
  /** Sort rows locally. Leave false for server-side sorting. */
  readonly clientSort = input(false);
  readonly mode = input<DataTableMode>('auto');
  readonly skeletonRows = input(6);
  readonly rowClickable = input(false);

  readonly selected = model<readonly string[]>([]);
  readonly sort = model<SortState | null>(null);
  readonly hiddenColumns = model<readonly string[]>([]);
  readonly expanded = model<readonly string[]>([]);

  readonly rowClick = output<T>();
  readonly retry = output<void>();

  protected readonly cellTemplates = contentChildren<AppCellDirective<T>>(AppCellDirective);
  protected readonly rowActions = contentChild<AppRowActionsDirective<T>>(AppRowActionsDirective);
  protected readonly rowExpansion =
    contentChild<AppRowExpansionDirective<T>>(AppRowExpansionDirective);

  protected readonly widths = signal<Readonly<Record<string, number>>>({});
  protected readonly resizing = signal<string | null>(null);

  protected readonly effectiveMode = computed<'table' | 'cards'>(() => {
    const mode = this.mode();
    if (mode !== 'auto') {
      return mode;
    }
    return this.viewport.isMobile() ? 'cards' : 'table';
  });

  protected readonly visibleColumns = computed(() => {
    const hidden = new Set(this.hiddenColumns());
    return this.columns().filter((column) => !hidden.has(column.key));
  });

  protected readonly hideableColumns = computed(() =>
    this.columns().filter((column) => column.hideable !== false),
  );

  protected readonly sortedRows = computed(() => {
    const rows = this.rows();
    const sort = this.sort();
    if (!this.clientSort() || !sort) {
      return rows;
    }
    const column = this.columns().find((c) => c.key === sort.key);
    if (!column) {
      return rows;
    }
    const factor = sort.direction === 'asc' ? 1 : -1;
    return [...rows].sort(
      (a, b) => factor * compareValues(this.valueOf(a, column), this.valueOf(b, column)),
    );
  });

  protected readonly rowIds = computed(() => this.sortedRows().map((row) => this.rowId()(row)));
  protected readonly selectedSet = computed(() => new Set(this.selected()));
  protected readonly expandedSet = computed(() => new Set(this.expanded()));

  protected readonly allSelected = computed(() => {
    const ids = this.rowIds();
    return ids.length > 0 && ids.every((id) => this.selectedSet().has(id));
  });
  protected readonly someSelected = computed(
    () => !this.allSelected() && this.rowIds().some((id) => this.selectedSet().has(id)),
  );

  protected readonly cardTitleColumn = computed(
    () => this.columns().find((c) => c.cardPriority === 1) ?? this.columns()[0],
  );
  protected readonly cardSubtitleColumn = computed(() =>
    this.columns().find((c) => c.cardPriority === 2),
  );
  protected readonly cardDetailColumns = computed(() =>
    this.visibleColumns()
      .filter((c) => (c.cardPriority ?? 0) >= 3)
      .sort((a, b) => (a.cardPriority ?? 0) - (b.cardPriority ?? 0)),
  );

  protected readonly showState = computed(
    () => !this.loading() && (this.error() !== null || this.rows().length === 0),
  );
  protected readonly skeletonIndexes = computed(() =>
    Array.from({ length: this.skeletonRows() }, (_, i) => i),
  );
  protected readonly hasFixedWidths = computed(() => Object.keys(this.widths()).length > 0);

  protected readonly extraColumnCount = computed(
    () => (this.selectable() ? 1 : 0) + (this.rowExpansion() ? 1 : 0) + (this.rowActions() ? 1 : 0),
  );
  protected readonly skeletonCells = computed(() =>
    Array.from({ length: this.visibleColumns().length + this.extraColumnCount() }, (_, i) => i),
  );

  // ---- values ---------------------------------------------------------------
  protected valueOf(row: T, column: ColumnDef<T>): unknown {
    return column.accessor ? column.accessor(row) : (row as Record<string, unknown>)[column.key];
  }

  protected textOf(row: T, column: ColumnDef<T>): string {
    const value = this.valueOf(row, column);
    if (column.format) {
      return column.format(value, row);
    }
    return value === null || value === undefined ? '' : String(value);
  }

  protected templateFor(column: ColumnDef<T>): CellTemplate<T> | null {
    return (
      this.cellTemplates().find((directive) => directive.column() === column.key)?.template ?? null
    );
  }

  protected widthOf(column: ColumnDef<T>): string | null {
    const resized = this.widths()[column.key];
    return resized !== undefined ? `${resized}px` : (column.width ?? null);
  }

  // ---- sorting ---------------------------------------------------------------
  protected toggleSort(column: ColumnDef<T>): void {
    if (!column.sortable) {
      return;
    }
    this.sort.set(nextSort(this.sort(), column.key));
  }

  protected ariaSort(column: ColumnDef<T>): 'ascending' | 'descending' | 'none' | null {
    if (!column.sortable) {
      return null;
    }
    const sort = this.sort();
    if (sort?.key !== column.key) {
      return 'none';
    }
    return sort.direction === 'asc' ? 'ascending' : 'descending';
  }

  // ---- selection -------------------------------------------------------------
  protected isSelected(row: T): boolean {
    return this.selectedSet().has(this.rowId()(row));
  }

  protected toggleRow(row: T): void {
    const id = this.rowId()(row);
    const set = new Set(this.selected());
    if (set.has(id)) {
      set.delete(id);
    } else {
      set.add(id);
    }
    this.selected.set([...set]);
  }

  protected toggleAll(): void {
    if (this.allSelected()) {
      const ids = new Set(this.rowIds());
      this.selected.set(this.selected().filter((id) => !ids.has(id)));
    } else {
      this.selected.set([...new Set([...this.selected(), ...this.rowIds()])]);
    }
  }

  protected clearSelection(): void {
    this.selected.set([]);
  }

  // ---- expansion -------------------------------------------------------------
  protected isExpanded(row: T): boolean {
    return this.expandedSet().has(this.rowId()(row));
  }

  protected toggleExpanded(row: T): void {
    const id = this.rowId()(row);
    const set = new Set(this.expanded());
    if (set.has(id)) {
      set.delete(id);
    } else {
      set.add(id);
    }
    this.expanded.set([...set]);
  }

  // ---- column visibility -----------------------------------------------------
  protected isHidden(column: ColumnDef<T>): boolean {
    return this.hiddenColumns().includes(column.key);
  }

  protected toggleColumn(column: ColumnDef<T>): void {
    const hidden = this.hiddenColumns();
    this.hiddenColumns.set(
      hidden.includes(column.key)
        ? hidden.filter((key) => key !== column.key)
        : [...hidden, column.key],
    );
  }

  // ---- resizing --------------------------------------------------------------
  protected startResize(event: PointerEvent, column: ColumnDef<T>, header: HTMLElement): void {
    if (!this.resizable()) {
      return;
    }
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = header.getBoundingClientRect().width;
    const min = 64;
    this.resizing.set(column.key);

    const onMove = (move: PointerEvent): void => {
      const next = Math.max(min, Math.round(startWidth + (move.clientX - startX)));
      this.widths.update((widths) => ({ ...widths, [column.key]: next }));
    };
    const onUp = (): void => {
      this.resizing.set(null);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    this.destroyRef.onDestroy(onUp);
  }

  protected resizeByKeyboard(
    event: KeyboardEvent,
    column: ColumnDef<T>,
    header: HTMLElement,
  ): void {
    let step = 0;
    if (event.key === 'ArrowLeft') {
      step = -16;
    } else if (event.key === 'ArrowRight') {
      step = 16;
    }
    if (step === 0) {
      return;
    }
    event.preventDefault();
    const current = this.widths()[column.key] ?? header.getBoundingClientRect().width;
    this.widths.update((widths) => ({
      ...widths,
      [column.key]: Math.max(64, Math.round(current + step)),
    }));
  }

  protected onRowClick(row: T, event: Event): void {
    if (!this.rowClickable()) {
      return;
    }
    const target = event.target as HTMLElement;
    if (target.closest('button, a, input, label, [role="menu"], .app-data-table__interactive')) {
      return;
    }
    this.rowClick.emit(row);
  }

  protected onRowKeydown(row: T, event: KeyboardEvent): void {
    if (
      this.rowClickable() &&
      (event.key === 'Enter' || event.key === ' ') &&
      event.target === event.currentTarget
    ) {
      event.preventDefault();
      this.rowClick.emit(row);
    }
  }

  protected trackRow = (_: number, row: T): string => this.rowId()(row);
}
