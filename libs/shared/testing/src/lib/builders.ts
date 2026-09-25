import { type Page } from '@senbilan/core/application';
import {
  IsoDateTime,
  RoleId,
  UserId,
  createSession,
  type PermissionKey,
  type Role,
  type Session,
  type User,
} from '@senbilan/core/domain';

const NOW = IsoDateTime('2026-01-01T00:00:00.000Z');

/** Domain test fixture — prefer over ad-hoc object literals in specs. */
export const buildUser = (overrides: Partial<User> = {}): User => ({
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

export const buildRole = (overrides: Partial<Role> = {}): Role => ({
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

export const buildSession = (
  overrides: {
    readonly user?: User;
    readonly roleIds?: Session['roleIds'];
    readonly permissions?: readonly PermissionKey[];
    readonly issuedAt?: IsoDateTime;
    readonly expiresAt?: IsoDateTime;
  } = {},
): Session => {
  const user = overrides.user ?? buildUser();
  return createSession({
    user,
    roleIds: overrides.roleIds ?? user.roleIds,
    permissions: overrides.permissions ?? ['users:read', 'users:write'],
    issuedAt: overrides.issuedAt ?? NOW,
    expiresAt: overrides.expiresAt ?? IsoDateTime('2099-01-01T00:00:00.000Z'),
  });
};

export const buildPage = <T>(
  items: readonly T[],
  overrides: Partial<Pick<Page<T>, 'page' | 'size' | 'total'>> = {},
): Page<T> => ({
  items,
  total: overrides.total ?? items.length,
  page: overrides.page ?? 1,
  size: overrides.size ?? Math.max(items.length, 1),
});
