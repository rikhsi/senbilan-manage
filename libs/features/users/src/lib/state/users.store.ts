import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  DEFAULT_PAGE_SIZE,
  type UserListFilter,
  type UserListRequest,
  type UserSortField,
} from '@senbilan/core/application';
import { type SortState } from '@senbilan/design-system/ui';
import { withPersistence } from '@senbilan/shared/ng';

export type UsersViewMode = 'table' | 'cards';

export interface UsersColumnState {
  readonly hiddenColumns: readonly string[];
  /** Preferred column key order; unknown keys append in definition order. */
  readonly columnOrder: readonly string[];
}

interface UsersUiState {
  search: string;
  page: number;
  size: number;
  sort: SortState | null;
  filter: UserListFilter;
  selectedIds: readonly string[];
  viewMode: UsersViewMode;
  columnState: UsersColumnState;
}

const emptyColumnState = (): UsersColumnState => ({
  hiddenColumns: [],
  columnOrder: [],
});

const normalizeColumnState = (value: unknown): UsersColumnState => {
  if (!value || typeof value !== 'object') {
    return emptyColumnState();
  }
  const raw = value as Partial<UsersColumnState>;
  return {
    hiddenColumns: Array.isArray(raw.hiddenColumns) ? [...raw.hiddenColumns] : [],
    columnOrder: Array.isArray(raw.columnOrder) ? [...raw.columnOrder] : [],
  };
};

const initialState: UsersUiState = {
  search: '',
  page: 1,
  size: DEFAULT_PAGE_SIZE,
  sort: null,
  filter: {},
  selectedIds: [],
  viewMode: 'table',
  columnState: emptyColumnState(),
};

const SORT_FIELD_MAP: Record<string, UserSortField> = {
  name: 'firstName',
  email: 'email',
  status: 'status',
  lastActive: 'lastActiveAt',
};

/** Reorder defs by persisted keys; keep unknown defs after known ones. */
export const orderColumns = <T extends { key: string }>(
  defs: readonly T[],
  order: readonly string[],
): readonly T[] => {
  if (order.length === 0) {
    return defs;
  }
  const byKey = new Map(defs.map((d) => [d.key, d] as const));
  const seen = new Set<string>();
  const ordered: T[] = [];
  for (const key of order) {
    const def = byKey.get(key);
    if (def) {
      ordered.push(def);
      seen.add(key);
    }
  }
  for (const def of defs) {
    if (!seen.has(def.key)) {
      ordered.push(def);
    }
  }
  return ordered;
};

export const UsersStore = signalStore(
  withState(initialState),
  withPersistence('senbilan.users.ui', (state) => ({
    columnState: state.columnState,
    viewMode: state.viewMode,
    sort: state.sort,
  })),
  withHooks({
    onInit(store) {
      patchState(store, {
        columnState: normalizeColumnState(store.columnState()),
      });
    },
  }),
  withComputed((store) => ({
    listRequest: computed((): UserListRequest => {
      const sort = store.sort();
      const search = store.search().trim();
      const filter = store.filter();
      const sortSpec =
        sort && SORT_FIELD_MAP[sort.key]
          ? ({
              field: SORT_FIELD_MAP[sort.key] as UserSortField,
              direction: sort.direction,
            } as const)
          : null;
      return {
        page: store.page(),
        size: store.size(),
        ...(search ? { search } : {}),
        ...(Object.keys(filter).length > 0 ? { filter } : {}),
        ...(sortSpec ? { sort: [sortSpec] as const } : {}),
      };
    }),
    selectedCount: computed(() => store.selectedIds().length),
    activeFilterCount: computed(() => {
      let count = store.search().trim() ? 1 : 0;
      const filter = store.filter();
      if (filter.status?.length) {
        count += 1;
      }
      if (filter.roleIds?.length) {
        count += 1;
      }
      return count;
    }),
  })),
  withMethods((store) => ({
    setSearch(search: string): void {
      patchState(store, { search, page: 1, selectedIds: [] });
    },

    setPage(page: number): void {
      patchState(store, { page });
    },

    setPageSize(size: number): void {
      patchState(store, { size, page: 1 });
    },

    setSort(sort: SortState | null): void {
      patchState(store, { sort, page: 1 });
    },

    setFilter(filter: UserListFilter): void {
      patchState(store, { filter, page: 1, selectedIds: [] });
    },

    setSelectedIds(selectedIds: readonly string[]): void {
      patchState(store, { selectedIds });
    },

    setViewMode(viewMode: UsersViewMode): void {
      patchState(store, { viewMode });
    },

    setHiddenColumns(hiddenColumns: readonly string[]): void {
      patchState(store, {
        columnState: { ...store.columnState(), hiddenColumns },
      });
    },

    setColumnOrder(columnOrder: readonly string[]): void {
      patchState(store, {
        columnState: { ...store.columnState(), columnOrder },
      });
    },

    resetFilters(): void {
      patchState(store, {
        search: '',
        filter: {},
        page: 1,
        sort: null,
        selectedIds: [],
      });
    },
  })),
);

export type UsersStore = InstanceType<typeof UsersStore>;
