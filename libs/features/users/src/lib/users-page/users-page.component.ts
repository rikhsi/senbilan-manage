import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { AdminCatalogRepository, type AdminUserSummary } from '@senbilan/core/application';
import {
  AppButtonComponent,
  AppCellDirective,
  AppDataTableComponent,
  AppEmptyStateComponent,
  AppSearchInputComponent,
  AppStatusComponent,
  type ColumnDef,
  type DataTableLabels,
  ToastService,
} from '@senbilan/design-system/ui';

@Component({
  selector: 'users-page',
  imports: [
    RouterLink,
    TranslocoPipe,
    AppButtonComponent,
    AppDataTableComponent,
    AppSearchInputComponent,
    AppStatusComponent,
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
  private readonly toast = inject(ToastService);

  protected readonly search = linkedSignal(() => '');
  protected readonly loading = signal(false);
  protected readonly error = signal(false);
  protected readonly rows = signal<readonly AdminUserSummary[]>([]);

  protected readonly columns = computed<readonly ColumnDef<AdminUserSummary>[]>(() => [
    {
      key: 'name',
      header: this.i18n.translate('users.name'),
      accessor: (row) => row.name || row.email || row.id,
      cardPriority: 1,
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
      accessor: (row) => row.status,
      cardPriority: 3,
    },
    {
      key: 'role',
      header: this.i18n.translate('users.role'),
      accessor: (row) => row.role,
    },
    {
      key: 'plan',
      header: this.i18n.translate('users.plan'),
      accessor: (row) => row.plan,
    },
  ]);

  protected readonly tableLabels = computed<DataTableLabels>(() => {
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
      columns: actions,
      resizeColumn: actions,
    };
  });

  protected readonly rowId = (row: AdminUserSummary): string => row.id;

  constructor() {
    void this.reload();
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

  protected onSearch(value: string): void {
    this.search.set(value);
    void this.reload();
  }

  protected onRowClick(row: AdminUserSummary): void {
    void this.router.navigate(['/users', row.id]);
  }

  protected async reload(): Promise<void> {
    this.loading.set(true);
    this.error.set(false);
    try {
      const q = this.search().trim();
      const page = await this.catalog.listUsers({
        ...(q ? { q } : {}),
        limit: 50,
      });
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
