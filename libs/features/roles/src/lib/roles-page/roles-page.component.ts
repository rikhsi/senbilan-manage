import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { RoleRepository, UpdateRoleUseCase } from '@senbilan/core/application';
import { ALL_PERMISSIONS, type PermissionKey, type Role } from '@senbilan/core/domain';
import { RoleBadgeComponent } from '@senbilan/entities/role';
import {
  PermissionMatrixComponent,
  type PermissionMatrixGroup,
} from '@senbilan/entities/permission';
import { AppButtonComponent } from '@senbilan/design-system/ui';

@Component({
  selector: 'roles-page',
  imports: [TranslocoPipe, AppButtonComponent, RoleBadgeComponent, PermissionMatrixComponent],
  templateUrl: './roles-page.component.html',
  styleUrl: './roles-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolesPageComponent {
  private readonly i18n = inject(TranslocoService);
  private readonly rolesRepo = inject(RoleRepository, { optional: true });

  protected readonly roles = signal<readonly Role[]>([]);
  protected readonly selectedId = signal<string | null>(null);
  protected readonly selectedPermissions = signal<readonly PermissionKey[]>([]);
  protected readonly saving = signal(false);
  protected readonly loading = signal(false);

  protected readonly selectedRole = computed(() => {
    const id = this.selectedId();
    return this.roles().find((r) => r.id === id) ?? null;
  });

  protected readonly matrixGroups = computed<readonly PermissionMatrixGroup[]>(() => {
    const byResource = new Map<string, PermissionMatrixGroup['permissions'][number][]>();
    for (const permission of ALL_PERMISSIONS) {
      const label = permission.key;
      const bucket = byResource.get(permission.resource) ?? [];
      bucket.push({ ...permission, label });
      byResource.set(permission.resource, bucket);
    }
    return [...byResource.entries()].map(([resource, permissions]) => ({
      resource,
      label: resource,
      permissions,
    }));
  });

  constructor() {
    void this.reload();
  }

  protected selectRole(role: Role): void {
    this.selectedId.set(role.id);
    this.selectedPermissions.set([...role.permissions]);
  }

  protected usersCountLabel(count: number): string {
    return this.i18n.translate('roles.usersCount', { count });
  }

  protected async save(): Promise<void> {
    const role = this.selectedRole();
    if (!role || !this.rolesRepo) {
      return;
    }
    this.saving.set(true);
    try {
      await new UpdateRoleUseCase(this.rolesRepo).execute(role.id, {
        name: role.name,
        description: role.description,
        permissions: this.selectedPermissions(),
      });
      await this.reload();
      this.selectedId.set(role.id);
    } finally {
      this.saving.set(false);
    }
  }

  private async reload(): Promise<void> {
    this.loading.set(true);
    try {
      if (!this.rolesRepo) {
        this.roles.set([]);
        return;
      }
      const list = await this.rolesRepo.findAll();
      this.roles.set(list);
      const current = this.selectedId();
      const next = list.find((r) => r.id === current) ?? list[0] ?? null;
      if (next) {
        this.selectRole(next);
      }
    } finally {
      this.loading.set(false);
    }
  }
}
