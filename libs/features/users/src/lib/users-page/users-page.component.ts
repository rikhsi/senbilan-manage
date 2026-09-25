import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { UserRepository } from '@senbilan/core/application';
import { fullName, type User, UserId } from '@senbilan/core/domain';
import {
  toUserViewModel,
  UserAvatarComponent,
  UserMutations,
  UserQueries,
  userStatusTone,
} from '@senbilan/entities/user';
import {
  AppButtonComponent,
  AppCellDirective,
  AppConfirmDialogService,
  AppDataTableComponent,
  AppFilterBarComponent,
  AppModalService,
  AppRowActionsDirective,
  AppSearchInputComponent,
  AppStatusComponent,
  type ColumnDef,
  type DataTableLabels,
  type SortState,
} from '@senbilan/design-system/ui';
import { AuthStore } from '@senbilan/shared/auth';
import { injectQuery } from '@tanstack/angular-query-experimental';
import {
  UserFormDrawerComponent,
  type UserFormDrawerData,
  type UserFormDrawerResult,
} from '../user-form-drawer/user-form-drawer.component';
import { orderColumns, UsersStore } from '../state/users.store';

@Component({
  selector: 'users-page',
  imports: [
    RouterLink,
    TranslocoPipe,
    AppButtonComponent,
    AppDataTableComponent,
    AppFilterBarComponent,
    AppSearchInputComponent,
    AppStatusComponent,
    AppCellDirective,
    AppRowActionsDirective,
    UserAvatarComponent,
  ],
  providers: [UsersStore],
  templateUrl: './users-page.component.html',
  styleUrl: './users-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersPageComponent {
  private readonly i18n = inject(TranslocoService);
  private readonly router = inject(Router);
  private readonly modal = inject(AppModalService);
  private readonly confirm = inject(AppConfirmDialogService);
  private readonly userQueries = inject(UserQueries);
  private readonly userMutations = inject(UserMutations);
  private readonly usersRepo = inject(UserRepository, { optional: true });
  private readonly auth = inject(AuthStore);
  protected readonly store = inject(UsersStore);

  private readonly listQuery = injectQuery(() =>
    this.userQueries.listOptions(this.store.listRequest()),
  );

  protected readonly rows = computed(() => this.listQuery.data()?.items ?? []);
  protected readonly loading = computed(() => this.listQuery.isPending());
  protected readonly error = computed(() =>
    this.listQuery.isError() ? this.i18n.translate('users.table.errorTitle') : null,
  );
  protected readonly activeFilterCount = computed(() => this.store.activeFilterCount());

  protected readonly search = linkedSignal(() => this.store.search());
  protected readonly selected = linkedSignal(() => this.store.selectedIds());
  protected readonly sort = linkedSignal(() => this.store.sort());
  protected readonly hiddenColumns = linkedSignal(() => this.store.columnState().hiddenColumns);

  protected readonly columns = computed<readonly ColumnDef<User>[]>(() => {
    const defs: readonly ColumnDef<User>[] = [
      {
        key: 'name',
        header: this.i18n.translate('users.name'),
        accessor: (row) => fullName(row),
        sortable: true,
        cardPriority: 1,
      },
      {
        key: 'email',
        header: this.i18n.translate('users.email'),
        accessor: (row) => row.email,
        sortable: true,
        cardPriority: 2,
      },
      {
        key: 'status',
        header: this.i18n.translate('users.status'),
        accessor: (row) => row.status,
        sortable: true,
        cardPriority: 3,
      },
      {
        key: 'roles',
        header: this.i18n.translate('users.roles'),
        accessor: (row) => row.roleIds.join(','),
        cardPriority: 4,
      },
      {
        key: 'lastActive',
        header: this.i18n.translate('users.lastActive'),
        accessor: (row) => row.lastActiveAt,
        sortable: true,
        cardPriority: 5,
      },
    ];
    return orderColumns(defs, this.store.columnState().columnOrder);
  });

  protected readonly tableLabels = computed<DataTableLabels>(() => ({
    selectAll: this.i18n.translate('users.table.selectAll'),
    selectRow: this.i18n.translate('users.table.selectRow'),
    sortBy: this.i18n.translate('users.table.sortBy'),
    actions: this.i18n.translate('users.table.actions'),
    expand: this.i18n.translate('users.table.expand'),
    collapse: this.i18n.translate('users.table.collapse'),
    retry: this.i18n.translate('users.table.retry'),
    emptyTitle: this.i18n.translate('users.table.emptyTitle'),
    emptyDescription: this.i18n.translate('users.table.emptyDescription'),
    errorTitle: this.i18n.translate('users.table.errorTitle'),
    selectedCount: (count) => String(count),
    clearSelection: this.i18n.translate('users.table.clearSelection'),
    columns: this.i18n.translate('users.table.columns'),
    resizeColumn: this.i18n.translate('users.table.resizeColumn'),
  }));

  protected readonly viewMode = computed(() => this.store.viewMode());
  protected readonly statusTone = userStatusTone;
  protected readonly viewOf = toUserViewModel;

  protected rowId = (row: User): string => row.id;

  protected statusLabel(status: User['status']): string {
    return this.i18n.translate('users.statuses.' + status);
  }

  protected onSearch(value: string): void {
    this.store.setSearch(value);
  }

  protected setViewMode(mode: 'table' | 'cards'): void {
    this.store.setViewMode(mode);
  }

  protected resetFilters(): void {
    this.store.resetFilters();
  }

  protected onSortChange(sort: SortState | null): void {
    this.store.setSort(sort);
  }

  protected onSelectedChange(ids: readonly string[]): void {
    this.store.setSelectedIds(ids);
  }

  protected onHiddenColumnsChange(hiddenColumns: readonly string[]): void {
    this.store.setHiddenColumns(hiddenColumns);
  }

  protected onRowClick(row: User): void {
    void this.router.navigate(['/users', row.id]);
  }

  protected async openCreate(): Promise<void> {
    await this.openDrawer({ mode: 'create', roles: [] });
  }

  protected async openEdit(row: User): Promise<void> {
    await this.openDrawer({ mode: 'edit', user: row, roles: [] });
  }

  protected async bulkDelete(): Promise<void> {
    const ids = this.store.selectedIds();
    if (ids.length === 0 || !this.usersRepo) {
      return;
    }
    const ok = await this.confirm.ask({
      title: this.i18n.translate('users.bulkDelete'),
      message: this.i18n.translate('users.confirmDelete'),
      confirmLabel: this.i18n.translate('users.delete'),
      cancelLabel: this.i18n.translate('users.cancel'),
      tone: 'danger',
    });
    if (!ok) {
      return;
    }
    const actorId = this.auth.user()?.id ?? UserId('__self__');
    await this.userMutations.deleteMany.mutateAsync({
      ids: ids.map(UserId),
      actorId,
    });
    this.store.setSelectedIds([]);
  }

  private async openDrawer(data: UserFormDrawerData): Promise<void> {
    const ref = this.modal.openDrawer<
      UserFormDrawerResult | undefined,
      UserFormDrawerData,
      UserFormDrawerComponent
    >(UserFormDrawerComponent, {
      data,
      width: 'md',
      ariaLabel: this.i18n.translate(data.mode === 'create' ? 'users.create' : 'users.edit'),
    });
    const result = await new Promise<UserFormDrawerResult | undefined>((resolve) => {
      ref.closed.subscribe((value) => resolve(value ?? undefined));
    });
    if (!result || !this.usersRepo) {
      return;
    }
    const roleIds = result.roleIds.length > 0 ? result.roleIds : ['placeholder'];
    if (data.mode === 'create') {
      await this.userMutations.create.mutateAsync({
        email: result.email,
        firstName: result.firstName,
        lastName: result.lastName,
        roleIds,
      });
    } else if (data.user) {
      await this.userMutations.update.mutateAsync({
        id: data.user.id,
        data: {
          email: data.user.email,
          firstName: result.firstName,
          lastName: result.lastName,
          roleIds,
        },
      });
    }
  }
}
