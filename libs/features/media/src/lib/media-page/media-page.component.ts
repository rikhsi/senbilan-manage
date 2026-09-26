import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { AdminCatalogRepository, type AdminMediaSummary } from '@senbilan/core/application';
import { AppListPageComponent, type BreadcrumbItem } from '@senbilan/design-system/layout';
import {
  AppButtonComponent,
  AppColumnSettingsComponent,
  AppCursorPaginationComponent,
  AppCellDirective,
  AppDataTableComponent,
  AppEmptyStateComponent,
  AppFormFieldComponent,
  AppInputDirective,
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
  EMPTY_MEDIA_FILTERS,
  MEDIA_COLUMN_KEYS,
  MEDIA_COLUMNS_KEY,
  MEDIA_HIDEABLE_COLUMNS,
  mediaStatusLabelKey,
  mediaStatusTone,
  type MediaListFilters,
} from './media-page.model';

@Component({
  selector: 'media-page',
  imports: [
    FormsModule,
    RouterLink,
    TranslocoPipe,
    AppListPageComponent,
    AppButtonComponent,
    AppColumnSettingsComponent,
    AppCursorPaginationComponent,
    AppCellDirective,
    AppDataTableComponent,
    AppEmptyStateComponent,
    AppFormFieldComponent,
    AppInputDirective,
    AppListFiltersComponent,
    AppSelectComponent,
    AppStatusComponent,
    AppTagComponent,
  ],
  templateUrl: './media-page.component.html',
  styleUrl: './media-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MediaPageComponent {
  private readonly catalog = inject(AdminCatalogRepository);
  private readonly i18n = inject(TranslocoService);
  private readonly i18nReady = injectTranslocoReady();
  private readonly router = inject(Router);

  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly rows = signal<readonly AdminMediaSummary[]>([]);
  protected readonly page = signal(1);
  protected readonly pageSize = signal(20);
  protected readonly hasNext = signal(false);
  private readonly cursors = signal<readonly (string | null)[]>([null]);
  protected readonly pageCount = computed(() => Math.max(1, this.cursors().length));
  private filterKey = '';
  private requestId = 0;
  protected readonly filtersOpen = signal(false);
  private readonly columnPrefs = loadColumnPrefs(
    MEDIA_COLUMNS_KEY,
    MEDIA_COLUMN_KEYS,
    MEDIA_HIDEABLE_COLUMNS,
  );
  protected readonly hiddenColumns = signal<readonly string[]>(this.columnPrefs.hidden);
  protected readonly columnOrder = signal<readonly string[]>(this.columnPrefs.order);
  protected readonly applied = signal<MediaListFilters>({ ...EMPTY_MEDIA_FILTERS });
  protected readonly draft = signal<MediaListFilters>({ ...EMPTY_MEDIA_FILTERS });
  protected readonly breadcrumbs: readonly BreadcrumbItem[] = [
    { labelKey: 'nav.dashboard', route: '/dashboard' },
    { labelKey: 'nav.media' },
  ];

  protected readonly columns = computed<readonly ColumnDef<AdminMediaSummary>[]>(() => {
    this.i18nReady();
    return [
      {
        key: 'purpose',
        header: this.i18n.translate('media.purpose'),
        accessor: (row) => this.text(row.purpose),
        cardPriority: 1,
        hideable: false,
      },
      {
        key: 'contentType',
        header: this.i18n.translate('media.contentType'),
        accessor: (row) => this.text(row.contentType),
        cardPriority: 2,
      },
      {
        key: 'status',
        header: this.i18n.translate('media.status'),
        accessor: (row) => this.statusLabel(row.status),
        cardPriority: 3,
      },
      {
        key: 'size',
        header: this.i18n.translate('media.size'),
        accessor: (row) => this.text(row.sizeBytes),
        cardPriority: 4,
      },
      {
        key: 'createdAt',
        header: this.i18n.translate('media.createdAt'),
        accessor: (row) => this.formatTimestamp(row.createdAt),
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
      selectedCount: (count) => this.i18n.translate('common.selectedCount', { count }),
    };
  });

  protected readonly statusOptions = computed<readonly SelectOption<string>[]>(() => {
    this.i18nReady();
    return [
      { value: '', label: this.i18n.translate('common.all') },
      { value: 'pending', label: this.i18n.translate('media.statusPending') },
      { value: 'ready', label: this.i18n.translate('media.statusReady') },
    ];
  });

  protected readonly filterCount = computed(() => {
    const filters = this.applied();
    return [filters.ownerId, filters.coupleId, filters.purpose, filters.status].filter(
      (value) => value.length > 0,
    ).length;
  });

  protected readonly chips = computed(() => {
    this.i18nReady();
    const filters = this.applied();
    const chips: { id: keyof MediaListFilters; label: string }[] = [];
    if (filters.ownerId) {
      chips.push({ id: 'ownerId', label: filters.ownerId });
    }
    if (filters.coupleId) {
      chips.push({ id: 'coupleId', label: filters.coupleId });
    }
    if (filters.purpose) {
      chips.push({ id: 'purpose', label: filters.purpose });
    }
    if (filters.status) {
      chips.push({ id: 'status', label: this.statusLabel(filters.status) });
    }
    return chips;
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
      emptyTitle: this.i18n.translate('media.emptyTitle'),
      emptyDescription: '',
      errorTitle: this.i18n.translate('media.errorTitle'),
      selectedCount: (count) => this.i18n.translate('common.selectedCount', { count }),
      clearSelection: this.i18n.translate('common.clearSelection'),
      columns: this.i18n.translate('common.columns'),
      resizeColumn: actions,
    };
  });

  protected readonly rowId = (row: AdminMediaSummary): string => row.id;

  constructor() {
    effect(() => {
      const hidden = this.hiddenColumns();
      const order = this.columnOrder();
      const storage = columnPrefsStorage();
      if (!storage) {
        return;
      }
      writeColumnPrefs(storage, MEDIA_COLUMNS_KEY, { hidden, order });
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

  protected onDraftOwner(value: string): void {
    this.draft.update((current) => ({ ...current, ownerId: value }));
  }

  protected onDraftCouple(value: string): void {
    this.draft.update((current) => ({ ...current, coupleId: value }));
  }

  protected onDraftPurpose(value: string): void {
    this.draft.update((current) => ({ ...current, purpose: value }));
  }

  protected onDraftStatus(value: string | null): void {
    this.draft.update((current) => ({ ...current, status: value ?? '' }));
  }

  protected applyFilters(): void {
    const draft = this.draft();
    this.applied.set({
      ownerId: draft.ownerId.trim(),
      coupleId: draft.coupleId.trim(),
      purpose: draft.purpose.trim(),
      status: draft.status,
    });
  }

  protected resetFilters(): void {
    this.draft.set({ ...EMPTY_MEDIA_FILTERS });
    this.applied.set({ ...EMPTY_MEDIA_FILTERS });
    this.filtersOpen.set(false);
  }

  protected removeChip(id: keyof MediaListFilters): void {
    this.applied.update((current) => ({ ...current, [id]: '' }));
  }

  protected statusLabel(status: string): string {
    const key = mediaStatusLabelKey(status);
    return key ? this.i18n.translate(key) : this.text(status);
  }

  protected statusTone(status: string) {
    return mediaStatusTone(status);
  }

  protected text(value: string): string {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : '—';
  }

  protected onRowClick(row: AdminMediaSummary): void {
    void this.router.navigate(['/media', row.id]);
  }

  protected reload(): void {
    const page = this.page();
    void this.fetchPage(this.applied(), this.pageSize(), this.cursors()[page - 1] ?? null, page);
  }

  private async fetchPage(
    filters: MediaListFilters,
    limit: number,
    cursor: string | null,
    page: number,
  ): Promise<void> {
    const requestId = ++this.requestId;
    this.loading.set(true);
    this.error.set(false);
    try {
      const result = await this.catalog.listMedia({
        limit,
        ...(cursor ? { cursor } : {}),
        ...(filters.ownerId ? { ownerId: filters.ownerId } : {}),
        ...(filters.coupleId ? { coupleId: filters.coupleId } : {}),
        ...(filters.purpose ? { purpose: filters.purpose } : {}),
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
