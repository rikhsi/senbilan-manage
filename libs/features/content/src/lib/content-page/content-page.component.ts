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
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { AdminCatalogRepository, type AdminContentSummary } from '@senbilan/core/application';
import { AppListPageComponent, type BreadcrumbItem } from '@senbilan/design-system/layout';
import {
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
  CONTENT_COLUMN_KEYS,
  CONTENT_COLUMNS_KEY,
  CONTENT_HIDEABLE_COLUMNS,
  contentKindLabelKey,
  contentLanguageLabelKey,
  contentStatusLabelKey,
  contentStatusTone,
  EMPTY_CONTENT_FILTERS,
  type ContentListFilters,
} from './content-page.model';

@Component({
  selector: 'content-page',
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
    AppListFiltersComponent,
    AppSelectComponent,
    AppStatusComponent,
    AppTagComponent,
  ],
  templateUrl: './content-page.component.html',
  styleUrl: './content-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentPageComponent {
  private readonly catalog = inject(AdminCatalogRepository);
  private readonly i18n = inject(TranslocoService);
  private readonly i18nReady = injectTranslocoReady();
  private readonly router = inject(Router);

  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly rows = signal<readonly AdminContentSummary[]>([]);
  protected readonly page = signal(1);
  protected readonly pageSize = signal(20);
  protected readonly hasNext = signal(false);
  private readonly cursors = signal<readonly (string | null)[]>([null]);
  protected readonly pageCount = computed(() => Math.max(1, this.cursors().length));
  private filterKey = '';
  private requestId = 0;
  protected readonly filtersOpen = signal(false);
  private readonly columnPrefs = loadColumnPrefs(
    CONTENT_COLUMNS_KEY,
    CONTENT_COLUMN_KEYS,
    CONTENT_HIDEABLE_COLUMNS,
  );
  protected readonly hiddenColumns = signal<readonly string[]>(this.columnPrefs.hidden);
  protected readonly columnOrder = signal<readonly string[]>(this.columnPrefs.order);
  protected readonly applied = signal<ContentListFilters>({ ...EMPTY_CONTENT_FILTERS });
  protected readonly draft = signal<ContentListFilters>({ ...EMPTY_CONTENT_FILTERS });

  protected readonly breadcrumbs: readonly BreadcrumbItem[] = [
    { labelKey: 'nav.dashboard', route: '/dashboard' },
    { labelKey: 'nav.content' },
  ];

  protected readonly columns = computed<readonly ColumnDef<AdminContentSummary>[]>(() => {
    this.i18nReady();
    return [
      {
        key: 'title',
        header: this.i18n.translate('content.name'),
        accessor: (row) => this.text(row.title),
        cardPriority: 1,
        hideable: false,
      },
      {
        key: 'kind',
        header: this.i18n.translate('content.kind'),
        accessor: (row) => this.kindLabel(row.kind),
        cardPriority: 2,
      },
      {
        key: 'status',
        header: this.i18n.translate('content.status'),
        accessor: (row) => this.statusLabel(row.status),
        cardPriority: 3,
      },
      {
        key: 'language',
        header: this.i18n.translate('content.language'),
        accessor: (row) => this.languageLabel(row.language),
        cardPriority: 4,
      },
      {
        key: 'updatedAt',
        header: this.i18n.translate('content.updatedAt'),
        accessor: (row) => this.formatTimestamp(row.updatedAt),
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
      { value: 'CONTENT_STATUS_DRAFT', label: this.i18n.translate('content.statusDraft') },
      { value: 'CONTENT_STATUS_PUBLISHED', label: this.i18n.translate('content.statusPublished') },
      {
        value: 'CONTENT_STATUS_UNPUBLISHED',
        label: this.i18n.translate('content.statusUnpublished'),
      },
    ];
  });

  protected readonly kindOptions = computed<readonly SelectOption<string>[]>(() => {
    this.i18nReady();
    return [
      { value: '', label: this.i18n.translate('common.all') },
      { value: 'CONTENT_KIND_ARTICLE', label: this.i18n.translate('content.kindArticle') },
      { value: 'CONTENT_KIND_BOOK', label: this.i18n.translate('content.kindBook') },
      { value: 'CONTENT_KIND_PODCAST', label: this.i18n.translate('content.kindPodcast') },
      { value: 'CONTENT_KIND_VIDEO', label: this.i18n.translate('content.kindVideo') },
    ];
  });

  protected readonly languageOptions = computed<readonly SelectOption<string>[]>(() => {
    this.i18nReady();
    return [
      { value: '', label: this.i18n.translate('common.all') },
      { value: 'LANGUAGE_UZ', label: this.i18n.translate('content.languageUz') },
      { value: 'LANGUAGE_RU', label: this.i18n.translate('content.languageRu') },
    ];
  });

  protected readonly filterCount = computed(() => {
    const filters = this.applied();
    return [filters.status, filters.kind, filters.language].filter((value) => value.length > 0)
      .length;
  });

  protected readonly chips = computed(() => {
    this.i18nReady();
    const filters = this.applied();
    const chips: { id: keyof ContentListFilters; label: string }[] = [];
    if (filters.status) {
      chips.push({ id: 'status', label: this.statusLabel(filters.status) });
    }
    if (filters.kind) {
      chips.push({ id: 'kind', label: this.kindLabel(filters.kind) });
    }
    if (filters.language) {
      chips.push({ id: 'language', label: this.languageLabel(filters.language) });
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

  protected readonly tableLabels = computed<DataTableLabels>(() => this.labels());
  protected readonly rowId = (row: AdminContentSummary): string => row.id;

  constructor() {
    effect(() => {
      const hidden = this.hiddenColumns();
      const order = this.columnOrder();
      const storage = columnPrefsStorage();
      if (!storage) {
        return;
      }
      writeColumnPrefs(storage, CONTENT_COLUMNS_KEY, { hidden, order });
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

  protected onDraftKind(value: string | null): void {
    this.draft.update((current) => ({ ...current, kind: value ?? '' }));
  }

  protected onDraftLanguage(value: string | null): void {
    this.draft.update((current) => ({ ...current, language: value ?? '' }));
  }

  protected applyFilters(): void {
    this.applied.set({ ...this.draft() });
  }

  protected resetFilters(): void {
    this.draft.set({ ...EMPTY_CONTENT_FILTERS });
    this.applied.set({ ...EMPTY_CONTENT_FILTERS });
    this.filtersOpen.set(false);
  }

  protected removeChip(id: keyof ContentListFilters): void {
    this.applied.update((current) => ({ ...current, [id]: '' }));
  }

  protected kindLabel(kind: string): string {
    const key = contentKindLabelKey(kind);
    return key ? this.i18n.translate(key) : this.text(kind);
  }

  protected languageLabel(language: string): string {
    const key = contentLanguageLabelKey(language);
    return key ? this.i18n.translate(key) : this.text(language);
  }

  protected statusLabel(status: string): string {
    const key = contentStatusLabelKey(status);
    return key ? this.i18n.translate(key) : this.text(status);
  }

  protected statusTone(status: string) {
    return contentStatusTone(status);
  }

  protected text(value: string): string {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : '—';
  }

  protected onRowClick(row: AdminContentSummary): void {
    void this.router.navigate(['/content', row.id]);
  }

  protected reload(): void {
    const page = this.page();
    void this.fetchPage(this.applied(), this.pageSize(), this.cursors()[page - 1] ?? null, page);
  }

  private async fetchPage(
    filters: ContentListFilters,
    limit: number,
    cursor: string | null,
    page: number,
  ): Promise<void> {
    const requestId = ++this.requestId;
    this.loading.set(true);
    this.error.set(false);
    try {
      const result = await this.catalog.listContents({
        limit,
        ...(cursor ? { cursor } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.kind ? { kind: filters.kind } : {}),
        ...(filters.language ? { language: filters.language } : {}),
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

  private labels(): DataTableLabels {
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
      emptyTitle: this.i18n.translate('content.emptyTitle'),
      emptyDescription: '',
      errorTitle: this.i18n.translate('content.errorTitle'),
      selectedCount: (count) => this.i18n.translate('common.selectedCount', { count }),
      clearSelection: this.i18n.translate('common.clearSelection'),
      columns: this.i18n.translate('common.columns'),
      resizeColumn: actions,
    };
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
