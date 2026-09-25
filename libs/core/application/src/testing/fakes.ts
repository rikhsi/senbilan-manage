/**
 * In-memory fakes for application ports. Test-only; not exported from the public API.
 */
import {
  IsoDateTime,
  type Role,
  RoleId,
  type Session,
  type User,
  UserId,
  type UserStatus,
  type UserWithRoles,
  createSession,
} from '@senbilan/core/domain';
import { type Page } from '../lib/contracts/pagination';
import { type AuthResult, type AuthTokens, type AuthRepository, type Credentials } from '../lib/ports/auth.repository';
import { type Clock } from '../lib/ports/clock.port';
import { type CreateRoleData, type RoleRepository, type UpdateRoleData } from '../lib/ports/role.repository';
import { type SessionStorage } from '../lib/ports/session-storage.port';
import {
  type CreateUserData,
  type UpdateUserData,
  type UserListRequest,
  type UserRepository,
} from '../lib/ports/user.repository';

const NOW = IsoDateTime('2026-01-01T00:00:00.000Z');

export const makeUser = (overrides: Partial<User> = {}): User => ({
  id: UserId('u1'),
  email: 'user@senbilan.uz' as User['email'],
  firstName: 'Test',
  lastName: 'User',
  avatarUrl: null,
  status: 'active',
  roleIds: [RoleId('admin')],
  lastActiveAt: null,
  createdAt: NOW,
  updatedAt: NOW,
  ...overrides,
});

export const makeRole = (overrides: Partial<Role> = {}): Role => ({
  id: RoleId('editor'),
  name: 'Editor',
  description: '',
  permissions: ['users:read'],
  isSystem: false,
  usersCount: 0,
  createdAt: NOW,
  updatedAt: NOW,
  ...overrides,
});

export const makeSession = (user = makeUser()): Session =>
  createSession({
    user,
    roleIds: user.roleIds,
    permissions: ['users:read', 'users:write'],
    issuedAt: NOW,
    expiresAt: IsoDateTime('2099-01-01T00:00:00.000Z'),
  });

export class FakeClock implements Clock {
  constructor(private current = new Date(NOW)) {}
  now(): Date {
    return this.current;
  }
  nowIso(): IsoDateTime {
    return IsoDateTime(this.current.toISOString());
  }
}

export class InMemoryUserRepository implements UserRepository {
  readonly calls: string[] = [];
  constructor(public users: User[] = []) {}

  async findPage(request: UserListRequest): Promise<Page<User>> {
    this.calls.push('findPage');
    const start = (request.page - 1) * request.size;
    return {
      items: this.users.slice(start, start + request.size),
      total: this.users.length,
      page: request.page,
      size: request.size,
    };
  }
  async findById(id: UserId): Promise<UserWithRoles | null> {
    const user = this.users.find((u) => u.id === id);
    return user ? { ...user, roles: [] } : null;
  }
  async create(data: CreateUserData): Promise<User> {
    const user = makeUser({ ...data, id: UserId(`u${this.users.length + 1}`) });
    this.users.push(user);
    return user;
  }
  async update(id: UserId, data: UpdateUserData): Promise<User> {
    const index = this.users.findIndex((u) => u.id === id);
    const current = this.users[index];
    if (!current) {
      throw new Error('missing');
    }
    const next: User = {
      ...current,
      ...(data.firstName !== undefined ? { firstName: data.firstName } : {}),
      ...(data.lastName !== undefined ? { lastName: data.lastName } : {}),
      ...(data.roleIds !== undefined ? { roleIds: data.roleIds } : {}),
      ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
    };
    this.users[index] = next;
    return next;
  }
  async setStatus(id: UserId, status: UserStatus): Promise<User> {
    return this.update(id, {}).then((u) => {
      const next = { ...u, status };
      this.users = this.users.map((x) => (x.id === id ? next : x));
      return next;
    });
  }
  async deleteMany(ids: readonly UserId[]): Promise<void> {
    this.calls.push(`deleteMany:${ids.join(',')}`);
    this.users = this.users.filter((u) => !ids.includes(u.id));
  }
}

export class InMemoryRoleRepository implements RoleRepository {
  constructor(public roles: Role[] = []) {}
  async findAll(): Promise<readonly Role[]> {
    return this.roles;
  }
  async findById(id: RoleId): Promise<Role | null> {
    return this.roles.find((r) => r.id === id) ?? null;
  }
  async create(data: CreateRoleData): Promise<Role> {
    const role = makeRole({ ...data, id: RoleId(`r${this.roles.length + 1}`) });
    this.roles.push(role);
    return role;
  }
  async update(id: RoleId, data: UpdateRoleData): Promise<Role> {
    const current = await this.findById(id);
    if (!current) {
      throw new Error('missing');
    }
    const next: Role = {
      ...current,
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.permissions !== undefined ? { permissions: data.permissions } : {}),
    };
    this.roles = this.roles.map((r) => (r.id === id ? next : r));
    return next;
  }
  async delete(id: RoleId): Promise<void> {
    this.roles = this.roles.filter((r) => r.id !== id);
  }
}

export class InMemorySessionStorage implements SessionStorage {
  private access: string | null = null;
  private refresh: string | null = null;
  getAccessToken(): string | null {
    return this.access;
  }
  setAccessToken(token: string | null): void {
    this.access = token;
  }
  getRefreshToken(): string | null {
    return this.refresh;
  }
  setRefreshToken(token: string | null): void {
    this.refresh = token;
  }
  clear(): void {
    this.access = null;
    this.refresh = null;
  }
}

export class FakeAuthRepository implements AuthRepository {
  refreshCalls = 0;
  failRefresh = false;
  session: Session = makeSession();

  async login(_credentials: Credentials): Promise<AuthResult> {
    return { session: this.session, tokens: { accessToken: 'access-1', expiresInSeconds: 900 } };
  }
  async logout(): Promise<void> {
    /* noop */
  }
  async refresh(): Promise<AuthTokens> {
    this.refreshCalls += 1;
    await new Promise((resolve) => setTimeout(resolve, 5));
    if (this.failRefresh) {
      throw new Error('refresh failed');
    }
    return { accessToken: `access-${this.refreshCalls + 1}`, expiresInSeconds: 900 };
  }
  async me(): Promise<Session> {
    return this.session;
  }
}
