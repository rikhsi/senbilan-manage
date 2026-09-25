import { Injectable, inject } from '@angular/core';
import {
  NotFoundError,
  UserRepository,
  type CreateUserData,
  type Page,
  type UpdateUserData,
  type UserListRequest,
} from '@senbilan/core/application';
import {
  IsoDateTime,
  UserId,
  type User,
  type UserStatus,
  type UserWithRoles,
} from '@senbilan/core/domain';
import { MockDataStore } from '../mock-data.store';

@Injectable()
export class MockUserRepository extends UserRepository {
  private readonly store = inject(MockDataStore);

  override async findPage(request: UserListRequest, _signal?: AbortSignal): Promise<Page<User>> {
    let items = [...this.store.db.users];
    const search = request.search?.trim().toLowerCase();
    if (search) {
      items = items.filter(
        (u) =>
          u.email.includes(search) ||
          u.firstName.toLowerCase().includes(search) ||
          u.lastName.toLowerCase().includes(search),
      );
    }
    const statuses = request.filter?.status;
    if (statuses && statuses.length > 0) {
      items = items.filter((u) => statuses.includes(u.status));
    }
    const roleIds = request.filter?.roleIds;
    if (roleIds && roleIds.length > 0) {
      items = items.filter((u) => u.roleIds.some((id) => roleIds.includes(id)));
    }
    const sort = request.sort?.[0];
    if (sort) {
      const dir = sort.direction === 'asc' ? 1 : -1;
      items.sort((a, b) => {
        const av = a[sort.field];
        const bv = b[sort.field];
        if (av === bv) {
          return 0;
        }
        if (av === null || av === undefined) {
          return 1;
        }
        if (bv === null || bv === undefined) {
          return -1;
        }
        return av > bv ? dir : -dir;
      });
    }
    const start = (request.page - 1) * request.size;
    return {
      items: items.slice(start, start + request.size),
      total: items.length,
      page: request.page,
      size: request.size,
    };
  }

  override async findById(id: UserId, _signal?: AbortSignal): Promise<UserWithRoles | null> {
    const user = this.store.db.users.find((u) => u.id === id);
    if (!user) {
      return null;
    }
    const roles = this.store.db.roles.filter((r) => user.roleIds.includes(r.id));
    return { ...user, roles };
  }

  override async create(data: CreateUserData): Promise<User> {
    const now = IsoDateTime(new Date().toISOString());
    const user: User = {
      id: UserId(`user-${crypto.randomUUID()}`),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      avatarUrl: null,
      status: 'invited',
      roleIds: [...data.roleIds],
      lastActiveAt: null,
      createdAt: now,
      updatedAt: now,
    };
    this.store.db.users.unshift(user);
    this.recomputeRoleCounts();
    return user;
  }

  override async update(id: UserId, data: UpdateUserData): Promise<User> {
    const index = this.store.db.users.findIndex((u) => u.id === id);
    const current = this.store.db.users[index];
    if (!current) {
      throw new NotFoundError('User', id);
    }
    const next: User = {
      ...current,
      ...(data.firstName !== undefined ? { firstName: data.firstName } : {}),
      ...(data.lastName !== undefined ? { lastName: data.lastName } : {}),
      ...(data.roleIds !== undefined ? { roleIds: data.roleIds } : {}),
      ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
      updatedAt: IsoDateTime(new Date().toISOString()),
    };
    this.store.db.users[index] = next;
    this.recomputeRoleCounts();
    return next;
  }

  override async setStatus(id: UserId, status: UserStatus): Promise<User> {
    return this.update(id, {}).then(async (user) => {
      const next = { ...user, status, updatedAt: IsoDateTime(new Date().toISOString()) };
      this.store.db.users = this.store.db.users.map((u) => (u.id === id ? next : u));
      return next;
    });
  }

  override async deleteMany(ids: readonly UserId[]): Promise<void> {
    const idSet = new Set(ids);
    this.store.db.users = this.store.db.users.filter((u) => !idSet.has(u.id));
    this.recomputeRoleCounts();
  }

  private recomputeRoleCounts(): void {
    this.store.db.roles = this.store.db.roles.map((role) => ({
      ...role,
      usersCount: this.store.db.users.filter((u) => u.roleIds.includes(role.id)).length,
    }));
  }
}
