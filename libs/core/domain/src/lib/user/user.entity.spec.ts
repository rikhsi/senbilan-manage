import { IsoDateTime, UserId } from '../shared/identifiers';
import { createEmail, type Email } from './email.value-object';
import {
  fullName,
  initials,
  transitionUserStatus,
  type User,
  validateUserName,
} from './user.entity';
import { InvalidEmailError, UserStatusTransitionError } from './user.errors';

const base: User = {
  id: UserId('u1'),
  email: 'grace@senbilan.uz' as Email,
  firstName: 'Grace',
  lastName: 'Hopper',
  avatarUrl: null,
  status: 'active',
  roleIds: [],
  lastActiveAt: null,
  createdAt: IsoDateTime('2026-01-01T00:00:00.000Z'),
  updatedAt: IsoDateTime('2026-01-01T00:00:00.000Z'),
};

describe('Email', () => {
  it('normalises and accepts valid addresses', () => {
    const result = createEmail('  Grace@Senbilan.UZ ');
    expect(result.ok && result.value).toBe('grace@senbilan.uz');
  });

  it('rejects invalid addresses with a domain error', () => {
    const result = createEmail('not-an-email');
    expect(!result.ok && result.error).toBeInstanceOf(InvalidEmailError);
  });
});

describe('User', () => {
  it('derives display helpers', () => {
    expect(fullName(base)).toBe('Grace Hopper');
    expect(initials(base)).toBe('GH');
  });

  it('validates names by trimming and length', () => {
    expect(validateUserName('  Ada ', 'firstName')).toEqual({ ok: true, value: 'Ada' });
    expect(validateUserName('   ', 'lastName').ok).toBe(false);
  });

  it('allows blocking an active user', () => {
    const result = transitionUserStatus(base, 'blocked');
    expect(result.ok && result.value.status).toBe('blocked');
  });

  it('forbids re-inviting a blocked user', () => {
    const blocked: User = { ...base, status: 'blocked' };
    const result = transitionUserStatus(blocked, 'invited');
    expect(!result.ok && result.error).toBeInstanceOf(UserStatusTransitionError);
  });
});
