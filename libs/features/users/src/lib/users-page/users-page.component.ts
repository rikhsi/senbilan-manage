import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import {
  CreateUserUseCase,
  DeleteUsersUseCase,
  type UserListRequest,
  UserRepository,
  UpdateUserUseCase,
} from '@senbilan/core/application';
import { fullName, type User, UserId } from '@senbilan/core/domain';
import {
  toUserViewModel,
  UserAvatarComponent,
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
import {
  UserFormDrawerComponent,
  type UserFormDrawerData,
  type UserFormDrawerResult,
} from '../user-form-drawer/user-form-drawer.component';

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
  private readonly usersRepo = inject(UserRepository, { optional: true });

  protected readonly search = signal('');
  protected readonly selected = signal<readonly string[]>([]);
  protected readonly sort = signal<SortState | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly rows = signal<readonly User[]>([]);

  protected readonly columns = computed<readonly ColumnDef<User>[]>(() => [
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
  ]);

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

  protected readonly activeFilterCount = computed(() => (this.search() ? 1 : 0));
  protected readonly statusTone = userStatusTone;
  protected readonly viewOf = toUserViewModel;

  constructor() {
    void this.reload();
  }

  protected rowId = (row: User): string => row.id;

  protected statusLabel(status: User['status']): string {
    return this.i18n.translate('users.statuses.' + status);
  }

  protected onSearch(value: string): void {
    this.search.set(value);
    void this.reload();
  }

  protected resetFilters(): void {
    this.search.set('');
    void this.reload();
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
    const ids = this.selected();
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
    // TODO: use AuthStore current user id once shared/auth lands.
    const useCase = new DeleteUsersUseCase(this.usersRepo);
    await useCase.execute(ids.map(UserId), UserId('__self__'));
    this.selected.set([]);
    await this.reload();
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
      await new CreateUserUseCase(this.usersRepo).execute({
        email: result.email,
        firstName: result.firstName,
        lastName: result.lastName,
        roleIds,
      });
    } else if (data.user) {
      await new UpdateUserUseCase(this.usersRepo).execute(data.user.id, {
        email: data.user.email,
        firstName: result.firstName,
        lastName: result.lastName,
        roleIds,
      });
    }
    await this.reload();
  }

  protected async reload(): Promise<void> {
    if (!this.usersRepo) {
      this.rows.set([]);
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    try {
      const request: UserListRequest = {
        page: 1,
        size: 50,
        ...(this.search() ? { search: this.search() } : {}),
      };
      const page = await this.userQueries.listOptions(request).queryFn({
        signal: new AbortController().signal,
      });
      this.rows.set(page.items);
    } catch {
      this.error.set(this.i18n.translate('users.table.errorTitle'));
    } finally {
      this.loading.set(false);
    }
  }
}
