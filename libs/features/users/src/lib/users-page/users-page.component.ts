/* eslint-disable max-lines -- catalog list wires filters, columns, and cursor pagination */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { AdminCatalogRepository, type AdminUserSummary } from '@senbilan/core/application';
import { AppListPageComponent, type BreadcrumbItem } from '@senbilan/design-system/layout';
import {
  AppButtonComponent,
  AppColumnSettingsComponent,
  AppCursorPaginationComponent,
  AppCellDirective,
  AppCheckboxComponent,
  AppDataTableComponent,
  AppEmptyStateComponent,
  AppFormFieldComponent,
  AppListFiltersComponent,
  AppSearchInputComponent,
  AppSelectComponent,
  AppStatusComponent,
  AppTagComponent,
  type ColumnDef,
  type CursorPaginationLabels,
  type DataTableLabels,
  type ListFiltersLabels,
  type SelectLabels,
  type SelectOption,
  ToastService,
} from '@senbilan/design-system/ui';
import { injectTranslocoReady } from '@senbilan/shared/i18n';
import { orderColumns, rememberNextCursor } from '@senbilan/shared/util';
import { map } from 'rxjs';
import {
  countUsersDrawerFilters,
  DEFAULT_HIDDEN_USER_COLUMNS,
  EMPTY_USERS_QUERY,
  isUsersListQueryEmpty,
  parseUsersListQuery,
  readUsersListSession,
  removeUsersFilterChip,
  userLanguageLabelKey,
  userPlanLabelKey,
  userRoleLabelKey,
  usersFilterChips,
  usersListBrowserSession,
  usersListQueryToApi,
  usersListQueryToParams,
  usersListUrlHasQuery,
  userStatusLabelKey,
  writeUsersListSession,
  type UsersFilterChipId,
  type UsersListQueryState,
} from './users-page.model';

const initialHiddenUserColumns = (): readonly string[] => {
  const storage = usersListBrowserSession();
  if (!storage) {
    return [...DEFAULT_HIDDEN_USER_COLUMNS];
  }
  return readUsersListSession(storage)?.hiddenColumns ?? [...DEFAULT_HIDDEN_USER_COLUMNS];
};

const initialUserColumnOrder = (): readonly string[] => {
  const storage = usersListBrowserSession();
  if (!storage) {
    return [];
  }
  return readUsersListSession(storage)?.columnOrder ?? [];
};

@Component({
  selector: 'users-page',
  imports: [
    FormsModule,
    RouterLink,
    TranslocoPipe,
    AppListPageComponent,
    AppButtonComponent,
    AppColumnSettingsComponent,
    AppCursorPaginationComponent,
    AppCheckboxComponent,
    AppDataTableComponent,
    AppFormFieldComponent,
    AppListFiltersComponent,
    AppSearchInputComponent,
    AppSelectComponent,
    AppStatusComponent,
    AppTagComponent,
    AppCellDirective,
    AppEmptyStateComponent,
  ],
  templateUrl: './users-page.component.html',
  styleUrl: './users-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersPageComponent {
  private readonly catalog = inject(AdminCatalogRepository);
  private readonly i18n = inject(TranslocoService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  private readonly i18nReady = injectTranslocoReady();

  protected readonly query = toSignal(
    this.route.queryParamMap.pipe(map((params) => parseUsersListQuery(params))),
    { initialValue: parseUsersListQuery(this.route.snapshot.queryParamMap) },
  );

  private readonly urlQ = signal(this.query().q);
  protected readonly searchDraft = signal(this.query().q);

  /** Draft inside the filter drawer — applied only on Apply. */
  protected readonly draft = signal<UsersListQueryState>({ ...this.query() });
  protected readonly filtersOpen = signal(false);
  protected readonly hiddenColumns = signal<readonly string[]>(initialHiddenUserColumns());
  protected readonly columnOrder = signal<readonly string[]>(initialUserColumnOrder());
  /** Skip the first empty query so a session restore is not overwritten. */
  private restorePending = false;

  protected readonly loading = signal(false);
  protected readonly error = signal(false);
  protected readonly rows = signal<readonly AdminUserSummary[]>([]);
  protected readonly page = signal(1);
  protected readonly pageSize = signal(20);
  protected readonly hasNext = signal(false);
  private readonly cursors = signal<readonly (string | null)[]>([null]);
  protected readonly pageCount = computed(() => Math.max(1, this.cursors().length));
  private queryKey = '';
  private requestId = 0;

  protected readonly breadcrumbs = computed<readonly BreadcrumbItem[]>(() => {
    this.i18nReady();
    return [{ labelKey: 'nav.dashboard', route: '/dashboard' }, { labelKey: 'users.title' }];
  });

  protected readonly drawerFilterCount = computed(() => countUsersDrawerFilters(this.query()));
  protected readonly chips = computed(() => usersFilterChips(this.query()));

  protected readonly pageLabels = computed<CursorPaginationLabels>(() => {
    this.i18nReady();
    return {
      previous: this.i18n.translate('common.previous'),
      next: this.i18n.translate('common.next'),
      page: this.i18n.translate('common.page'),
      pageSize: this.i18n.translate('common.pageSize'),
      summary: this.i18n.translate('common.pageSummary', { page: this.page() }),
    };
  });

  protected readonly filterLabels = computed<ListFiltersLabels>(() => {
    this.i18nReady();
    return {
      filters: this.i18n.translate('common.filters'),
      title: this.i18n.translate('common.filtersTitle'),
      apply: this.i18n.translate('common.apply'),
      reset: this.i18n.translate('common.reset'),
      close: this.i18n.translate('common.close'),
    };
  });

  protected readonly columns = computed<readonly ColumnDef<AdminUserSummary>[]>(() => {
    this.i18nReady();
    return [
      {
        key: 'name',
        header: this.i18n.translate('users.name'),
        accessor: (row) => this.displayName(row),
        cardPriority: 1,
        hideable: false,
      },
      {
        key: 'email',
        header: this.i18n.translate('users.email'),
        accessor: (row) => row.email || '—',
        cardPriority: 2,
      },
      {
        key: 'phone',
        header: this.i18n.translate('users.phone'),
        accessor: (row) => row.phone || '—',
        cardPriority: 3,
      },
      {
        key: 'status',
        header: this.i18n.translate('users.status'),
        accessor: (row) => this.i18n.translate(userStatusLabelKey(row.status)),
        cardPriority: 4,
      },
      {
        key: 'role',
        header: this.i18n.translate('users.role'),
        accessor: (row) => this.i18n.translate(userRoleLabelKey(row.role)),
        cardPriority: 5,
      },
      {
        key: 'plan',
        header: this.i18n.translate('users.plan'),
        accessor: (row) => this.i18n.translate(userPlanLabelKey(row.plan)),
        cardPriority: 6,
      },
      {
        key: 'id',
        header: this.i18n.translate('users.id'),
        accessor: (row) => row.id,
        cardPriority: 7,
      },
      {
        key: 'telegramId',
        header: this.i18n.translate('users.telegramId'),
        accessor: (row) => this.displayTelegram(row.telegramId),
        cardPriority: 8,
      },
      {
        key: 'language',
        header: this.i18n.translate('users.language'),
        accessor: (row) => this.languageLabel(row.language),
        cardPriority: 9,
      },
      {
        key: 'planExpiresAt',
        header: this.i18n.translate('users.planExpires'),
        accessor: (row) => this.formatTimestamp(row.planExpiresAt),
        cardPriority: 10,
      },
      {
        key: 'coupleId',
        header: this.i18n.translate('users.couple'),
        accessor: (row) => row.coupleId || '—',
        cardPriority: 11,
      },
      {
        key: 'createdAt',
        header: this.i18n.translate('users.createdAt'),
        accessor: (row) => this.formatTimestamp(row.createdAt),
        cardPriority: 12,
      },
      {
        key: 'deletedAt',
        header: this.i18n.translate('users.deletedAt'),
        accessor: (row) => this.formatTimestamp(row.deletedAt),
        cardPriority: 13,
      },
    ];
  });

  protected readonly columnSettings = computed(() =>
    this.columns().map((column) => ({
      key: column.key,
      header: column.header,
      hideable: column.hideable !== false,
    })),
  );

  protected readonly orderedColumns = computed(() =>
    orderColumns(this.columns(), this.columnOrder()),
  );

  protected readonly tableLabels = computed<DataTableLabels>(() => {
    this.i18nReady();
    const actions = this.i18n.translate('common.actions');
    return {
      selectAll: actions,
      selectRow: actions,
      sortBy: actions,
      actions,
      expand: actions,
      collapse: actions,
      retry: this.i18n.translate('common.retry'),
      emptyTitle: this.i18n.translate('users.emptyTitle'),
      emptyDescription: this.i18n.translate('users.emptyHint'),
      errorTitle: this.i18n.translate('users.errorTitle'),
      selectedCount: (count) => this.i18n.translate('common.selectedCount', { count }),
      clearSelection: this.i18n.translate('common.clearSelection'),
      columns: this.i18n.translate('common.columns'),
      resizeColumn: actions,
    };
  });

  protected readonly selectLabels = computed<SelectLabels>(() => {
    this.i18nReady();
    return {
      placeholder: this.i18n.translate('common.all'),
      searchPlaceholder: this.i18n.translate('common.search'),
      noResults: this.i18n.translate('common.empty'),
      clear: this.i18n.translate('common.reset'),
      selectedCount: (count) => this.i18n.translate('common.selectedCount', { count }),
    };
  });

  protected readonly statusOptions = computed<readonly SelectOption<string>[]>(() => {
    this.i18nReady();
    return [
      { value: '', label: this.i18n.translate('users.statusAll') },
      { value: 'USER_STATUS_ACTIVE', label: this.i18n.translate('users.statusActive') },
      { value: 'USER_STATUS_BLOCKED', label: this.i18n.translate('users.statusBlocked') },
    ];
  });

  protected readonly roleOptions = computed<readonly SelectOption<string>[]>(() => {
    this.i18nReady();
    return [
      { value: '', label: this.i18n.translate('users.roleAll') },
      { value: 'USER_ROLE_USER', label: this.i18n.translate('users.roleUser') },
      { value: 'USER_ROLE_ADMIN', label: this.i18n.translate('users.roleAdmin') },
    ];
  });

  protected readonly planOptions = computed<readonly SelectOption<string>[]>(() => {
    this.i18nReady();
    return [
      { value: '', label: this.i18n.translate('users.planAll') },
      { value: 'USER_PLAN_FREE', label: this.i18n.translate('users.planFree') },
      { value: 'USER_PLAN_PRO', label: this.i18n.translate('users.planPro') },
    ];
  });

  protected readonly rowId = (row: AdminUserSummary): string => row.id;

  constructor() {
    const saved = usersListBrowserSession();
    const stored = saved ? readUsersListSession(saved) : null;
    if (
      stored &&
      !usersListUrlHasQuery(this.route.snapshot.queryParamMap) &&
      !isUsersListQueryEmpty(stored.query)
    ) {
      this.restorePending = true;
      void this.patchQuery(stored.query);
    }

    effect(() => {
      const q = this.query().q;
      if (q !== this.urlQ()) {
        this.urlQ.set(q);
        this.searchDraft.set(q);
      }
    });

    effect(() => {
      const state = this.query();
      const page = this.page();
      const pageSize = this.pageSize();
      if (this.restorePending) {
        if (isUsersListQueryEmpty(state)) {
          return;
        }
        this.restorePending = false;
      }
      const key = JSON.stringify(state);
      if (key !== this.queryKey) {
        this.queryKey = key;
        untracked(() => this.cursors.set([null]));
        if (page !== 1) {
          this.page.set(1);
          return;
        }
      }
      untracked(() => this.persistListSession(state, this.hiddenColumns(), this.columnOrder()));
      const cursor = untracked(() => this.cursors()[page - 1] ?? null);
      void this.reload(state, pageSize, cursor, page);
    });

    effect(() => {
      const hidden = this.hiddenColumns();
      const order = this.columnOrder();
      if (this.restorePending) {
        return;
      }
      untracked(() => this.persistListSession(this.query(), hidden, order));
    });

    effect(() => {
      if (this.filtersOpen()) {
        this.draft.set({ ...this.query() });
      }
    });
  }

  protected displayName(row: AdminUserSummary): string {
    const name = row.name.trim();
    return name.length > 0 ? name : this.i18n.translate('users.nameMissing');
  }

  protected mailHref(email: string): string | null {
    const value = email.trim();
    return value.length > 0 ? `mailto:${value}` : null;
  }

  protected telHref(phone: string): string | null {
    const value = phone.trim();
    if (value.length === 0) {
      return null;
    }
    const dial = value.replace(/[^\d+]/g, '');
    return dial.length > 0 ? `tel:${dial}` : null;
  }

  protected displayTelegram(telegramId: string): string {
    const value = telegramId.trim();
    return value.length > 0 && value !== '0' ? value : '—';
  }

  protected languageLabel(language: string): string {
    const key = userLanguageLabelKey(language);
    return key ? this.i18n.translate(key) : '—';
  }

  protected formatTimestamp(value: string | null): string {
    if (!value) {
      return '—';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '—';
    }
    return new Intl.DateTimeFormat(this.i18n.getActiveLang(), {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  }

  protected statusTone(status: string): 'success' | 'warning' | 'danger' | 'neutral' {
    if (status.includes('ACTIVE') || status === 'active') {
      return 'success';
    }
    if (status.includes('BLOCKED') || status === 'blocked') {
      return 'danger';
    }
    return 'neutral';
  }

  protected statusLabel(status: string): string {
    return this.i18n.translate(userStatusLabelKey(status));
  }

  protected onSearchSubmit(value: string): void {
    this.searchDraft.set(value);
    void this.patchQuery({ ...this.query(), q: value.trim() });
  }

  protected onFiltersOpenChange(open: boolean): void {
    this.filtersOpen.set(open);
  }

  protected onDraftStatus(value: string | null): void {
    this.draft.update((current) => ({ ...current, status: value ?? '' }));
  }

  protected onDraftRole(value: string | null): void {
    this.draft.update((current) => ({ ...current, role: value ?? '' }));
  }

  protected onDraftPlan(value: string | null): void {
    this.draft.update((current) => ({ ...current, plan: value ?? '' }));
  }

  protected onDraftIncludeDeleted(checked: boolean): void {
    this.draft.update((current) => ({ ...current, includeDeleted: checked }));
  }

  protected applyFilters(): void {
    const next = { ...this.draft(), q: this.query().q };
    void this.patchQuery(next);
  }

  protected resetFilters(): void {
    this.searchDraft.set('');
    this.draft.set({ ...EMPTY_USERS_QUERY });
    void this.patchQuery({ ...EMPTY_USERS_QUERY });
    this.filtersOpen.set(false);
  }

  protected removeChip(id: UsersFilterChipId): void {
    void this.patchQuery(removeUsersFilterChip(this.query(), id));
  }

  protected onRowClick(row: AdminUserSummary): void {
    void this.router.navigate(['/users', row.id]);
  }

  protected refresh(): void {
    const page = this.page();
    void this.reload(this.query(), this.pageSize(), this.cursors()[page - 1] ?? null, page);
  }

  protected previousPage(): void {
    if (this.page() <= 1 || this.loading()) {
      return;
    }
    this.page.update((current) => current - 1);
  }

  protected nextPage(): void {
    if (!this.hasNext() || this.loading()) {
      return;
    }
    this.page.update((current) => current + 1);
  }

  protected goToPage(target: number): void {
    if (this.loading() || target === this.page() || target < 1 || target > this.cursors().length) {
      return;
    }
    this.page.set(target);
  }

  protected onPageSize(size: number): void {
    this.cursors.set([null]);
    this.hasNext.set(false);
    if (this.page() !== 1) {
      this.page.set(1);
    }
    this.pageSize.set(size);
  }

  private persistListSession(
    query: UsersListQueryState,
    hiddenColumns: readonly string[],
    columnOrder: readonly string[],
  ): void {
    const storage = usersListBrowserSession();
    if (!storage) {
      return;
    }
    writeUsersListSession(storage, { query, hiddenColumns, columnOrder });
  }

  private async patchQuery(state: UsersListQueryState): Promise<void> {
    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams: usersListQueryToParams(state),
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private async reload(
    state: UsersListQueryState,
    limit: number,
    cursor: string | null,
    page: number,
  ): Promise<void> {
    const requestId = ++this.requestId;
    this.loading.set(true);
    this.error.set(false);
    try {
      const result = await this.catalog.listUsers(usersListQueryToApi(state, { limit, cursor }));
      if (requestId !== this.requestId) {
        return;
      }
      this.rows.set(result.items);
      this.cursors.set(rememberNextCursor(this.cursors(), page, result.nextCursor));
      this.hasNext.set(result.nextCursor !== null);
    } catch {
      if (requestId !== this.requestId) {
        return;
      }
      this.rows.set([]);
      this.hasNext.set(false);
      this.error.set(true);
      this.toast.show({
        tone: 'danger',
        title: this.i18n.translate('users.errorTitle'),
        message: this.i18n.translate('users.errorHint'),
      });
    } finally {
      if (requestId === this.requestId) {
        this.loading.set(false);
      }
    }
  }
}
