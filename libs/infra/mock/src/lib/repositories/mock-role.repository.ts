import { Injectable, inject } from '@angular/core';
import {
  ConflictError,
  NotFoundError,
  RoleRepository,
  type CreateRoleData,
  type UpdateRoleData,
} from '@senbilan/core/application';
import { IsoDateTime, RoleId, type Role } from '@senbilan/core/domain';
import { MockDataStore } from '../mock-data.store';

@Injectable()
export class MockRoleRepository extends RoleRepository {
  private readonly store = inject(MockDataStore);

  override async findAll(_signal?: AbortSignal): Promise<readonly Role[]> {
    return this.store.db.roles;
  }

  override async findById(id: RoleId, _signal?: AbortSignal): Promise<Role | null> {
    return this.store.db.roles.find((r) => r.id === id) ?? null;
  }

  override async create(data: CreateRoleData): Promise<Role> {
    const now = IsoDateTime(new Date().toISOString());
    const role: Role = {
      id: RoleId(`role-${crypto.randomUUID()}`),
      name: data.name,
      description: data.description,
      permissions: [...data.permissions],
      isSystem: false,
      usersCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    this.store.db.roles = [...this.store.db.roles, role];
    return role;
  }

  override async update(id: RoleId, data: UpdateRoleData): Promise<Role> {
    const current = await this.findById(id);
    if (!current) {
      throw new NotFoundError('Role', id);
    }
    const next: Role = {
      ...current,
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.permissions !== undefined ? { permissions: data.permissions } : {}),
      updatedAt: IsoDateTime(new Date().toISOString()),
    };
    this.store.db.roles = this.store.db.roles.map((r) => (r.id === id ? next : r));
    return next;
  }

  override async delete(id: RoleId): Promise<void> {
    const current = await this.findById(id);
    if (!current) {
      throw new NotFoundError('Role', id);
    }
    if (current.isSystem) {
      throw new ConflictError('System roles cannot be deleted');
    }
    this.store.db.roles = this.store.db.roles.filter((r) => r.id !== id);
  }
}
