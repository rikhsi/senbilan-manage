import { IsoDateTime, RoleId } from '../shared/identifiers';
import { type Role, validateRoleName, withRolePermissions } from './role.entity';
import { SystemRoleImmutableError } from './role.errors';

const owner: Role = {
  id: RoleId('owner'),
  name: 'Owner',
  description: '',
  permissions: ['users:read', 'users:write', 'roles:write'],
  isSystem: true,
  usersCount: 1,
  createdAt: IsoDateTime('2026-01-01T00:00:00.000Z'),
  updatedAt: IsoDateTime('2026-01-01T00:00:00.000Z'),
};

describe('Role', () => {
  it('validates the name length', () => {
    expect(validateRoleName('A').ok).toBe(false);
    expect(validateRoleName(' Editor ')).toEqual({ ok: true, value: 'Editor' });
  });

  it('lets a system role gain permissions', () => {
    const result = withRolePermissions(owner, [...owner.permissions, 'settings:write']);
    expect(result.ok && result.value.permissions).toContain('settings:write');
  });

  it('refuses to strip permissions from a system role', () => {
    const result = withRolePermissions(owner, ['users:read']);
    expect(!result.ok && result.error).toBeInstanceOf(SystemRoleImmutableError);
  });

  it('deduplicates permissions for regular roles', () => {
    const editor: Role = { ...owner, id: RoleId('editor'), isSystem: false };
    const result = withRolePermissions(editor, ['users:read', 'users:read']);
    expect(result.ok && result.value.permissions).toEqual(['users:read']);
  });
});
