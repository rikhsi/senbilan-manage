import { IsoDateTime, RoleId, UserId } from '../shared/identifiers';
import { type User } from '../user/user.entity';
import { type Email } from '../user/email.value-object';
import { AccessPolicy, type PolicyRule } from './access.policy';
import { createSession, isSessionExpired } from './session.entity';

const user: User = {
  id: UserId('u1'),
  email: 'admin@senbilan.uz' as Email,
  firstName: 'Ada',
  lastName: 'Lovelace',
  avatarUrl: null,
  status: 'active',
  roleIds: [RoleId('admin')],
  lastActiveAt: null,
  createdAt: IsoDateTime('2026-01-01T00:00:00.000Z'),
  updatedAt: IsoDateTime('2026-01-01T00:00:00.000Z'),
};

const session = createSession({
  user,
  roleIds: [RoleId('admin')],
  permissions: ['users:read', 'users:write'],
  issuedAt: IsoDateTime('2026-01-01T00:00:00.000Z'),
  expiresAt: IsoDateTime('2026-01-01T01:00:00.000Z'),
});

describe('AccessPolicy', () => {
  const policy = new AccessPolicy();

  it('allows a permission granted by the session', () => {
    expect(policy.can(session, 'users:read')).toBe(true);
  });

  it('denies a permission that is not granted', () => {
    expect(policy.can(session, 'users:delete')).toBe(false);
  });

  it('denies everything for anonymous principals', () => {
    expect(policy.can(null, 'users:read')).toBe(false);
  });

  it('supports canAll / canAny', () => {
    expect(policy.canAll(session, ['users:read', 'users:write'])).toBe(true);
    expect(policy.canAll(session, ['users:read', 'users:delete'])).toBe(false);
    expect(policy.canAny(session, ['roles:read', 'users:write'])).toBe(true);
  });

  it('lets an explicit deny from an additional rule override RBAC allow', () => {
    const denyOwnAccount: PolicyRule = {
      name: 'deny-self',
      evaluate: (s, _permission, resource) =>
        resource?.type === 'user' && resource.id === s.user.id ? 'deny' : 'abstain',
    };
    const abac = new AccessPolicy([
      { name: 'rbac', evaluate: () => 'allow' },
      denyOwnAccount,
    ]);

    expect(abac.can(session, 'users:write', { type: 'user', id: 'u1' })).toBe(false);
    expect(abac.can(session, 'users:write', { type: 'user', id: 'u2' })).toBe(true);
  });
});

describe('Session', () => {
  it('detects expiry', () => {
    expect(isSessionExpired(session, new Date('2026-01-01T00:30:00.000Z'))).toBe(false);
    expect(isSessionExpired(session, new Date('2026-01-01T01:00:00.000Z'))).toBe(true);
  });
});
