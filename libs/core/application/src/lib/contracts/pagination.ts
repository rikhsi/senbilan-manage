export type SortDirection = 'asc' | 'desc';

export interface SortSpec<TField extends string = string> {
  readonly field: TField;
  readonly direction: SortDirection;
}

/** 1-based paging request shared by every list query. */
export interface PageRequest<TFilter = Record<string, never>, TSortField extends string = string> {
  readonly page: number;
  readonly size: number;
  readonly sort?: readonly SortSpec<TSortField>[];
  readonly search?: string;
  readonly filter?: TFilter;
}

export interface Page<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly size: number;
}

export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

export const emptyPage = <T>(request: Pick<PageRequest, 'page' | 'size'>): Page<T> => ({
  items: [],
  total: 0,
  page: request.page,
  size: request.size,
});

export const totalPages = (page: Pick<Page<unknown>, 'total' | 'size'>): number =>
  page.size > 0 ? Math.max(1, Math.ceil(page.total / page.size)) : 1;
