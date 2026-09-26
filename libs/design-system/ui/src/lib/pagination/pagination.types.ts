export interface CursorPaginationLabels {
  readonly previous: string;
  readonly next: string;
  /** Label for the page picker, e.g. "Страница". */
  readonly page: string;
  readonly pageSize: string;
  readonly summary: string;
}

export interface PaginationLabels {
  readonly previous: string;
  readonly next: string;
  readonly first: string;
  readonly last: string;
  readonly pageSize: string;
  /** e.g. "{{from}}–{{to}} of {{total}}" already interpolated by the caller. */
  readonly summary: string;
}
