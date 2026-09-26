import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { AdminCatalogRepository, type AdminBroadcastSummary } from '@senbilan/core/application';
import { AppListPageComponent, type BreadcrumbItem } from '@senbilan/design-system/layout';
import {
  AppButtonComponent,
  AppColumnSettingsComponent,
  AppCursorPaginationComponent,
  AppCellDirective,
  AppDataTableComponent,
  AppEmptyStateComponent,
  AppListFiltersComponent,
  AppStatusComponent,
  type ColumnDef,
  type CursorPaginationLabels,
  type DataTableLabels,
  type ListFiltersLabels,
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
  BROADCASTS_COLUMN_KEYS,
  BROADCASTS_COLUMNS_KEY,
  BROADCASTS_HIDEABLE_COLUMNS,
  broadcastStatusLabelKey,
  broadcastStatusTone,
} from './broadcasts-page.model';

@Component({
  selector: 'broadcasts-page',
  imports: [
    RouterLink,
    TranslocoPipe,
    AppListPageComponent,
    AppButtonComponent,
    AppColumnSettingsComponent,
    AppCursorPaginationComponent,
    AppCellDirective,
    AppDataTableComponent,
    AppEmptyStateComponent,
    AppListFiltersComponent,
    AppStatusComponent,
  ],
  templateUrl: './broadcasts-page.component.html',
  styleUrl: './broadcasts-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BroadcastsPageComponent {
  private readonly catalog = inject(AdminCatalogRepository);
  private readonly i18n = inject(TranslocoService);
  private readonly i18nReady = injectTranslocoReady();
  private readonly router = inject(Router);

  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly rows = signal<readonly AdminBroadcastSummary[]>([]);
  protected readonly page = signal(1);
  protected readonly pageSize = signal(20);
  protected readonly hasNext = signal(false);
  private readonly cursors = signal<readonly (string | null)[]>([null]);
  protected readonly pageCount = computed(() => Math.max(1, this.cursors().length));
  private requestId = 0;
  protected readonly columnsOpen = signal(false);
  private readonly columnPrefs = loadColumnPrefs(
    BROADCASTS_COLUMNS_KEY,
    BROADCASTS_COLUMN_KEYS,
    BROADCASTS_HIDEABLE_COLUMNS,
  );
  protected readonly hiddenColumns = signal<readonly string[]>(this.columnPrefs.hidden);
  protected readonly columnOrder = signal<readonly string[]>(this.columnPrefs.order);
  protected readonly breadcrumbs: readonly BreadcrumbItem[] = [
    { labelKey: 'nav.dashboard', route: '/dashboard' },
    { labelKey: 'nav.broadcasts' },
  ];

  protected readonly columns = computed<readonly ColumnDef<AdminBroadcastSummary>[]>(() => {
    this.i18nReady();
    return [
      {
        key: 'title',
        header: this.i18n.translate('broadcasts.name'),
        accessor: (row) => this.text(row.title),
        cardPriority: 1,
        hideable: false,
      },
      {
        key: 'status',
        header: this.i18n.translate('broadcasts.status'),
        accessor: (row) => this.statusLabel(row.status),
        cardPriority: 2,
      },
      {
        key: 'createdAt',
        header: this.i18n.translate('broadcasts.createdAt'),
        accessor: (row) => this.formatTimestamp(row.createdAt),
        cardPriority: 3,
      },
      {
        key: 'sentAt',
        header: this.i18n.translate('broadcasts.sentAt'),
        accessor: (row) => this.formatTimestamp(row.sentAt),
        cardPriority: 4,
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
      filters: this.i18n.translate('common.columns'),
      title: this.i18n.translate('common.columns'),
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
      emptyTitle: this.i18n.translate('broadcasts.emptyTitle'),
      emptyDescription: '',
      errorTitle: this.i18n.translate('broadcasts.errorTitle'),
      selectedCount: (count) => this.i18n.translate('common.selectedCount', { count }),
      clearSelection: this.i18n.translate('common.clearSelection'),
      columns: this.i18n.translate('common.columns'),
      resizeColumn: actions,
    };
  });

  protected readonly rowId = (row: AdminBroadcastSummary): string => row.id;

  constructor() {
    effect(() => {
      const hidden = this.hiddenColumns();
      const order = this.columnOrder();
      const storage = columnPrefsStorage();
      if (!storage) {
        return;
      }
      writeColumnPrefs(storage, BROADCASTS_COLUMNS_KEY, { hidden, order });
    });

    effect(() => {
      const page = this.page();
      const pageSize = this.pageSize();
      const cursor = untracked(() => this.cursors()[page - 1] ?? null);
      void this.fetchPage(pageSize, cursor, page);
    });
  }

  protected resetColumns(): void {
    this.hiddenColumns.set([]);
    this.columnOrder.set([]);
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

  protected statusLabel(status: string): string {
    const key = broadcastStatusLabelKey(status);
    return key ? this.i18n.translate(key) : this.text(status);
  }

  protected statusTone(status: string) {
    return broadcastStatusTone(status);
  }

  protected text(value: string): string {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : '—';
  }

  protected onRowClick(row: AdminBroadcastSummary): void {
    void this.router.navigate(['/broadcasts', row.id]);
  }

  protected reload(): void {
    const page = this.page();
    void this.fetchPage(this.pageSize(), this.cursors()[page - 1] ?? null, page);
  }

  private async fetchPage(limit: number, cursor: string | null, page: number): Promise<void> {
    const requestId = ++this.requestId;
    this.loading.set(true);
    this.error.set(false);
    try {
      const result = await this.catalog.listBroadcasts({
        limit,
        ...(cursor ? { cursor } : {}),
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
