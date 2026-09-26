/* eslint-disable max-lines -- catalog list wires filters, columns, and cursor pagination */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import {
  AdminCatalogRepository,
  type AdminCoupleMember,
  type AdminCoupleSummary,
} from '@senbilan/core/application';
import { AppListPageComponent, type BreadcrumbItem } from '@senbilan/design-system/layout';
import {
  AppAvatarComponent,
  AppButtonComponent,
  AppColumnSettingsComponent,
  AppCursorPaginationComponent,
  AppCellDirective,
  AppDataTableComponent,
  AppEmptyStateComponent,
  AppFormFieldComponent,
  AppListFiltersComponent,
  AppSelectComponent,
  AppStatusComponent,
  AppTagComponent,
  type ColumnDef,
  type CursorPaginationLabels,
  type DataTableLabels,
  type ListFiltersLabels,
  type SelectLabels,
  type SelectOption,
} from '@senbilan/design-system/ui';
import { injectTranslocoReady } from '@senbilan/shared/i18n';
import {
  columnPrefsStorage,
  loadColumnPrefs,
  orderColumns,
  rememberNextCursor,
  writeColumnPrefs,
} from '@senbilan/shared/util';
import {
  coupleMemberAvatarName,
  coupleMemberPhone,
  coupleMembers,
  coupleMemberTitle,
} from '../couple-member';
import {
  COUPLES_COLUMN_KEYS,
  COUPLES_COLUMNS_KEY,
  COUPLES_DEFAULT_HIDDEN_COLUMNS,
  COUPLES_HIDEABLE_COLUMNS,
  coupleStatusLabelKey,
  coupleStatusTone,
  EMPTY_COUPLES_FILTERS,
  type CouplesListFilters,
} from './couples-page.model';

@Component({
  selector: 'couples-page',
  imports: [
    FormsModule,
    TranslocoPipe,
    AppListPageComponent,
    AppAvatarComponent,
    AppButtonComponent,
    AppColumnSettingsComponent,
    AppCursorPaginationComponent,
    AppCellDirective,
    AppDataTableComponent,
    AppEmptyStateComponent,
    AppFormFieldComponent,
    AppListFiltersComponent,
    AppSelectComponent,
    AppStatusComponent,
    AppTagComponent,
  ],
  templateUrl: './couples-page.component.html',
  styleUrl: './couples-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CouplesPageComponent {
  private readonly catalog = inject(AdminCatalogRepository);
  private readonly i18n = inject(TranslocoService);
  private readonly i18nReady = injectTranslocoReady();

  /** Embedded in a record picker: same list, radio selection, no navigation. */
  readonly picking = input(false);
  readonly pickedId = model<string | null>(null);
  readonly pickedLabel = model('');
  private readonly router = inject(Router);

  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly rows = signal<readonly AdminCoupleSummary[]>([]);
  protected readonly page = signal(1);
  protected readonly pageSize = signal(20);
  protected readonly hasNext = signal(false);
  private readonly cursors = signal<readonly (string | null)[]>([null]);
  protected readonly pageCount = computed(() => Math.max(1, this.cursors().length));
  private filterKey = '';
  private requestId = 0;
  protected readonly filtersOpen = signal(false);
  private readonly columnPrefs = loadColumnPrefs(
    COUPLES_COLUMNS_KEY,
    COUPLES_COLUMN_KEYS,
    COUPLES_HIDEABLE_COLUMNS,
    COUPLES_DEFAULT_HIDDEN_COLUMNS,
  );
  protected readonly hiddenColumns = signal<readonly string[]>(this.columnPrefs.hidden);
  protected readonly columnOrder = signal<readonly string[]>(this.columnPrefs.order);
  protected readonly applied = signal<CouplesListFilters>({ ...EMPTY_COUPLES_FILTERS });
  protected readonly draft = signal<CouplesListFilters>({ ...EMPTY_COUPLES_FILTERS });

  protected readonly breadcrumbs = computed<readonly BreadcrumbItem[]>(() => {
    this.i18nReady();
    if (this.picking()) {
      return [{ labelKey: 'nav.couples' }];
    }
    return [{ labelKey: 'nav.dashboard', route: '/dashboard' }, { labelKey: 'nav.couples' }];
  });

  protected readonly columns = computed<readonly ColumnDef<AdminCoupleSummary>[]>(() => {
    this.i18nReady();
    return [
      {
        key: 'members',
        header: this.i18n.translate('couples.members'),
        accessor: (row) =>
          this.membersOf(row)
            .map((member) => this.memberPhone(member) || this.memberTitle(member))
            .join(', '),
        cardPriority: 1,
        hideable: false,
      },
      {
        key: 'status',
        header: this.i18n.translate('couples.status'),
        accessor: (row) => this.statusLabel(row.status),
        cardPriority: 2,
      },
      {
        key: 'createdAt',
        header: this.i18n.translate('couples.createdAt'),
        accessor: (row) => this.formatTimestamp(row.createdAt),
        cardPriority: 3,
      },
      {
        key: 'id',
        header: this.i18n.translate('couples.id'),
        accessor: (row) => this.text(row.id),
        cardPriority: 4,
      },
      {
        key: 'startedOn',
        header: this.i18n.translate('couples.startedOn'),
        accessor: (row) => this.formatCalendarDate(row.startedOn),
        cardPriority: 5,
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

  protected readonly selectLabels = computed<SelectLabels>(() => {
    this.i18nReady();
    return {
      placeholder: this.i18n.translate('common.all'),
      searchPlaceholder: this.i18n.translate('common.search'),
      noResults: this.i18n.translate('common.empty'),
      clear: this.i18n.translate('common.reset'),
      close: this.i18n.translate('common.close'),
      selectedCount: (count) => this.i18n.translate('common.selectedCount', { count }),
    };
  });

  protected readonly statusOptions = computed<readonly SelectOption<string>[]>(() => {
    this.i18nReady();
    return [
      { value: '', label: this.i18n.translate('common.all') },
      { value: 'waiting', label: this.i18n.translate('couples.statusWaiting') },
      { value: 'paired', label: this.i18n.translate('couples.statusPaired') },
    ];
  });

  protected readonly filterCount = computed(() => (this.applied().status ? 1 : 0));

  protected readonly chips = computed(() => {
    this.i18nReady();
    const status = this.applied().status;
    return status ? [{ id: 'status', label: this.statusLabel(status) }] : [];
  });

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
      emptyTitle: this.i18n.translate('couples.emptyTitle'),
      emptyDescription: '',
      errorTitle: this.i18n.translate('couples.errorTitle'),
      selectedCount: (count) => this.i18n.translate('common.selectedCount', { count }),
      clearSelection: this.i18n.translate('common.clearSelection'),
      columns: this.i18n.translate('common.columns'),
      resizeColumn: actions,
    };
  });

  protected readonly rowId = (row: AdminCoupleSummary): string => row.id;

  constructor() {
    effect(() => {
      const hidden = this.hiddenColumns();
      const order = this.columnOrder();
      const storage = columnPrefsStorage();
      if (!storage) {
        return;
      }
      writeColumnPrefs(storage, COUPLES_COLUMNS_KEY, {
        hidden,
        order,
        known: [...COUPLES_COLUMN_KEYS],
      });
    });

    effect(() => {
      if (this.filtersOpen()) {
        this.draft.set({ ...this.applied() });
      }
    });

    effect(() => {
      const filters = this.applied();
      const page = this.page();
      const pageSize = this.pageSize();
      const key = JSON.stringify(filters);
      if (key !== this.filterKey) {
        this.filterKey = key;
        untracked(() => this.cursors.set([null]));
        if (page !== 1) {
          this.page.set(1);
          return;
        }
      }
      const cursor = untracked(() => this.cursors()[page - 1] ?? null);
      void this.fetchPage(filters, pageSize, cursor, page);
    });
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

  protected onFiltersOpenChange(open: boolean): void {
    this.filtersOpen.set(open);
  }

  protected onDraftStatus(value: string | null): void {
    this.draft.update((current) => ({ ...current, status: value ?? '' }));
  }

  protected applyFilters(): void {
    this.applied.set({ ...this.draft() });
  }

  protected resetFilters(): void {
    this.draft.set({ ...EMPTY_COUPLES_FILTERS });
    this.applied.set({ ...EMPTY_COUPLES_FILTERS });
    this.filtersOpen.set(false);
  }

  protected removeChip(): void {
    this.applied.set({ ...EMPTY_COUPLES_FILTERS });
  }

  protected statusLabel(status: string): string {
    const key = coupleStatusLabelKey(status);
    return key ? this.i18n.translate(key) : this.person(status);
  }

  protected statusTone(status: string) {
    return coupleStatusTone(status);
  }

  protected membersOf(row: AdminCoupleSummary): readonly AdminCoupleMember[] {
    return coupleMembers(row);
  }

  protected memberTitle(member: AdminCoupleMember | null): string {
    return coupleMemberTitle(member, this.i18n.translate('couples.nameMissing'));
  }

  protected memberPhone(member: AdminCoupleMember | null): string {
    return coupleMemberPhone(member);
  }

  protected memberAvatarName(member: AdminCoupleMember): string {
    return coupleMemberAvatarName(member, this.i18n.translate('couples.nameMissing'));
  }

  protected person(name: string): string {
    const trimmed = name.trim();
    return trimmed.length > 0 ? trimmed : '—';
  }

  protected onRowClick(row: AdminCoupleSummary): void {
    if (this.picking()) {
      this.pickedLabel.set(this.pickedId() === row.id ? this.pickerLabel(row) : '');
      return;
    }
    void this.router.navigate(['/couples', row.id]);
  }

  private pickerLabel(row: AdminCoupleSummary): string {
    const label = this.membersOf(row)
      .map((member) => this.memberPhone(member) || this.memberTitle(member))
      .filter((value) => value.trim().length > 0)
      .join(', ');
    return label.length > 0 ? label : row.id;
  }

  protected reload(): void {
    const page = this.page();
    void this.fetchPage(this.applied(), this.pageSize(), this.cursors()[page - 1] ?? null, page);
  }

  private async fetchPage(
    filters: CouplesListFilters,
    limit: number,
    cursor: string | null,
    page: number,
  ): Promise<void> {
    const requestId = ++this.requestId;
    this.loading.set(true);
    this.error.set(false);
    try {
      const result = await this.catalog.listCouples({
        limit,
        ...(cursor ? { cursor } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      });
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
    } finally {
      if (requestId === this.requestId) {
        this.loading.set(false);
      }
    }
  }

  private text(value: string): string {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : '—';
  }

  private formatCalendarDate(value: string | null): string {
    if (!value) {
      return '—';
    }
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) {
      return this.text(value);
    }
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    if (Number.isNaN(date.getTime())) {
      return this.text(value);
    }
    return new Intl.DateTimeFormat(this.i18n.getActiveLang(), { dateStyle: 'medium' }).format(date);
  }

  private formatTimestamp(value: string | null): string {
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
}
