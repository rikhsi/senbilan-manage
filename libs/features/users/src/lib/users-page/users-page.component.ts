import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { AdminCatalogRepository, type AdminUserSummary } from '@senbilan/core/application';
import { AppListPageComponent, type BreadcrumbItem } from '@senbilan/design-system/layout';
import {
  AppButtonComponent,
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
  type DataTableLabels,
  type ListFiltersLabels,
  type SelectLabels,
  type SelectOption,
  ToastService,
} from '@senbilan/design-system/ui';
import { injectTranslocoReady } from '@senbilan/shared/i18n';
import { map } from 'rxjs';
import {
  countUsersDrawerFilters,
  EMPTY_USERS_QUERY,
  parseUsersListQuery,
  removeUsersFilterChip,
  userPlanLabelKey,
  userRoleLabelKey,
  usersFilterChips,
  usersListQueryToApi,
  usersListQueryToParams,
  userStatusLabelKey,
  type UsersFilterChipId,
  type UsersListQueryState,
} from './users-page.model';

@Component({
  selector: 'users-page',
  imports: [
    FormsModule,
    RouterLink,
    TranslocoPipe,
    AppListPageComponent,
    AppButtonComponent,
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
  protected readonly hiddenColumns = signal<readonly string[]>([]);

  protected readonly loading = signal(false);
  protected readonly error = signal(false);
  protected readonly rows = signal<readonly AdminUserSummary[]>([]);

  protected readonly breadcrumbs = computed<readonly BreadcrumbItem[]>(() => {
    this.i18nReady();
    return [{ labelKey: 'nav.dashboard', route: '/dashboard' }, { labelKey: 'users.title' }];
  });

  protected readonly drawerFilterCount = computed(() => countUsersDrawerFilters(this.query()));
  protected readonly chips = computed(() => usersFilterChips(this.query()));

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
        accessor: (row) => row.name || row.email || row.id,
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
      },
      {
        key: 'status',
        header: this.i18n.translate('users.status'),
        accessor: (row) => this.i18n.translate(userStatusLabelKey(row.status)),
        cardPriority: 3,
      },
      {
        key: 'role',
        header: this.i18n.translate('users.role'),
        accessor: (row) => this.i18n.translate(userRoleLabelKey(row.role)),
      },
      {
        key: 'plan',
        header: this.i18n.translate('users.plan'),
        accessor: (row) => this.i18n.translate(userPlanLabelKey(row.plan)),
      },
    ];
  });

  protected readonly hideableColumns = computed(() =>
    this.columns().filter((column) => column.hideable !== false),
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
    effect(() => {
      const q = this.query().q;
      if (q !== this.urlQ()) {
        this.urlQ.set(q);
        this.searchDraft.set(q);
      }
    });

    effect(() => {
      const state = this.query();
      void this.reload(state);
    });

    effect(() => {
      if (this.filtersOpen()) {
        this.draft.set({ ...this.query() });
      }
    });
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

  protected isColumnHidden(key: string): boolean {
    return this.hiddenColumns().includes(key);
  }

  protected canHideColumn(key: string): boolean {
    if (this.isColumnHidden(key)) {
      return true;
    }
    const visible = this.columns().filter((column) => !this.hiddenColumns().includes(column.key));
    return visible.length > 1;
  }

  protected onColumnVisibilityChange(key: string, visible: boolean): void {
    const hidden = this.hiddenColumns();
    if (visible) {
      this.hiddenColumns.set(hidden.filter((item) => item !== key));
      return;
    }
    if (!this.canHideColumn(key)) {
      return;
    }
    this.hiddenColumns.set([...hidden, key]);
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
    void this.reload(this.query());
  }

  private async patchQuery(state: UsersListQueryState): Promise<void> {
    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams: usersListQueryToParams(state),
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private async reload(state: UsersListQueryState): Promise<void> {
    this.loading.set(true);
    this.error.set(false);
    try {
      const page = await this.catalog.listUsers(usersListQueryToApi(state));
      this.rows.set(page.items);
    } catch {
      this.rows.set([]);
      this.error.set(true);
      this.toast.show({
        tone: 'danger',
        title: this.i18n.translate('users.errorTitle'),
        message: this.i18n.translate('users.errorHint'),
      });
    } finally {
      this.loading.set(false);
    }
  }
}
