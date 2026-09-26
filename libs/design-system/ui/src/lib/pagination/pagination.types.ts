export interface PaginationLabels {
  readonly previous: string;
  readonly next: string;
  readonly first: string;
  readonly last: string;
  readonly pageSize: string;
  /** e.g. "{{from}}–{{to}} of {{total}}" already interpolated by the caller. */
  readonly summary: string;
}
