import { type TemplateRef } from '@angular/core';

export type DataTableMode = 'auto' | 'table' | 'cards';

export type SortDirection = 'asc' | 'desc';

export interface SortState {
  readonly key: string;
  readonly direction: SortDirection;
}

export type ColumnAlign = 'start' | 'center' | 'end';

export interface ColumnDef<T> {
  /** Stable key — used for sort state, visibility, cell templates. */
  readonly key: string;
  readonly header: string;
  /** Read a value from the row; defaults to `row[key]`. */
  readonly accessor?: (row: T) => unknown;
  /** Format the value to text; ignored when an `appCell` template exists for this key. */
  readonly format?: (value: unknown, row: T) => string;
  readonly sortable?: boolean;
  readonly align?: ColumnAlign;
  /** Initial width (CSS length). Resizable columns update it at runtime. */
  readonly width?: string;
  readonly minWidth?: string;
  /** Can be hidden from the column picker (default true). */
  readonly hideable?: boolean;
  /**
   * Mobile card mode: 1 = card title, 2 = subtitle, 3+ = detail rows, 0/undefined = hidden in cards.
   */
  readonly cardPriority?: number;
  /** Extra CSS class for header and cells (e.g. `app-col--numeric`). */
  readonly cssClass?: string;
}

export interface DataTableLabels {
  readonly selectAll: string;
  readonly selectRow: string;
  readonly sortBy: string;
  readonly actions: string;
  readonly expand: string;
  readonly collapse: string;
  readonly retry: string;
  readonly emptyTitle: string;
  readonly emptyDescription: string;
  readonly errorTitle: string;
  readonly selectedCount: (count: number) => string;
  readonly clearSelection: string;
  readonly columns: string;
  readonly resizeColumn: string;
}

export interface CellContext<T> {
  readonly $implicit: T;
  readonly row: T;
  readonly value: unknown;
  readonly column: ColumnDef<T>;
}

export interface RowContext<T> {
  readonly $implicit: T;
  readonly row: T;
}

export type CellTemplate<T> = TemplateRef<CellContext<T>>;
export type RowTemplate<T> = TemplateRef<RowContext<T>>;

/** Cycle asc → desc → none. */
export const nextSort = (current: SortState | null, key: string): SortState | null => {
  if (current?.key !== key) {
    return { key, direction: 'asc' };
  }
  return current.direction === 'asc' ? { key, direction: 'desc' } : null;
};

export const compareValues = (a: unknown, b: unknown): number => {
  if (a === b) {
    return 0;
  }
  if (a === null || a === undefined) {
    return 1;
  }
  if (b === null || b === undefined) {
    return -1;
  }
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }
  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return Number(a) - Number(b);
  }
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
};
