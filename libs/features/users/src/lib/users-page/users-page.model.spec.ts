import { describe, expect, it } from 'vitest';
import {
  moveColumn,
  orderColumns,
  readColumnPrefs,
  rememberNextCursor,
} from '@senbilan/shared/util';
import {
  DEFAULT_HIDDEN_USER_COLUMNS,
  EMPTY_USERS_QUERY,
  isUserBlocked,
  isUserDeleted,
  readUsersListSession,
  sanitizeHiddenUserColumns,
  sanitizeUserColumnOrder,
  sanitizeUsersListQuery,
  writeUsersListSession,
  type UsersListSessionStorage,
} from './users-page.model';

class MemorySession implements UsersListSessionStorage {
  private readonly map = new Map<string, string>();

  getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
}

describe('isUserBlocked', () => {
  it('treats blocked wire statuses as blocked and active ones as not', () => {
    expect(isUserBlocked('USER_STATUS_BLOCKED')).toBe(true);
    expect(isUserBlocked('blocked')).toBe(true);
    expect(isUserBlocked('USER_STATUS_ACTIVE')).toBe(false);
    expect(isUserBlocked('')).toBe(false);
  });
});

describe('rememberNextCursor', () => {
  it('stores the cursor for the following page and drops a stale tail', () => {
    expect(rememberNextCursor([null], 1, 'page-2')).toEqual([null, 'page-2']);
    expect(rememberNextCursor([null, 'page-2', 'page-3'], 1, null)).toEqual([null]);
    expect(rememberNextCursor([null, 'page-2', 'page-3'], 1, 'page-2')).toEqual([
      null,
      'page-2',
      'page-3',
    ]);
  });
});

describe('isUserDeleted', () => {
  it('treats a deleted_at timestamp as deleted', () => {
    expect(isUserDeleted('2026-01-01T00:00:00Z')).toBe(true);
    expect(isUserDeleted(null)).toBe(false);
    expect(isUserDeleted(undefined)).toBe(false);
    expect(isUserDeleted('')).toBe(false);
    expect(isUserDeleted('   ')).toBe(false);
  });
});

describe('users list session', () => {
  it('round-trips filters and hidden columns', () => {
    const storage = new MemorySession();
    writeUsersListSession(storage, {
      query: { ...EMPTY_USERS_QUERY, status: 'USER_STATUS_BLOCKED', q: '  ada  ' },
      hiddenColumns: ['email', 'id'],
      columnOrder: ['status', 'name'],
    });

    expect(readUsersListSession(storage)).toEqual({
      query: { ...EMPTY_USERS_QUERY, status: 'USER_STATUS_BLOCKED', q: 'ada' },
      hiddenColumns: ['email', 'id'],
      columnOrder: ['status', 'name'],
    });
  });

  it('keeps a missing column order empty', () => {
    const storage = new MemorySession();
    storage.setItem(
      'senbilan.users.list',
      JSON.stringify({ query: { q: 'ada' }, hiddenColumns: ['email'] }),
    );
    expect(readUsersListSession(storage)?.columnOrder).toEqual([]);
    expect(sanitizeUserColumnOrder(['nope', 'name', 'email'])).toEqual(['name', 'email']);
  });

  it('drops unknown filter and column values', () => {
    expect(
      sanitizeUsersListQuery({ status: 'nope', role: 'USER_ROLE_ADMIN', q: 12 as never }),
    ).toEqual({
      ...EMPTY_USERS_QUERY,
      role: 'USER_ROLE_ADMIN',
    });
    expect(sanitizeHiddenUserColumns(['id', 'nope', 1])).toEqual(['id']);
    expect(sanitizeHiddenUserColumns(null)).toEqual(DEFAULT_HIDDEN_USER_COLUMNS);
  });

  it('returns null when nothing is stored', () => {
    expect(readUsersListSession(new MemorySession())).toBeNull();
  });
});

describe('column order', () => {
  it('moves a column into the target slot', () => {
    expect(moveColumn(['a', 'b', 'c'], 'a', 'c')).toEqual(['b', 'c', 'a']);
    expect(moveColumn(['a', 'b', 'c'], 'c', 'a')).toEqual(['c', 'a', 'b']);
    expect(moveColumn(['a', 'b', 'c'], 'b', 'b')).toEqual(['a', 'b', 'c']);
  });

  it('keeps unknown keys behind the saved order', () => {
    expect(
      orderColumns([{ key: 'a' }, { key: 'b' }, { key: 'c' }], ['c', 'a']).map((item) => item.key),
    ).toEqual(['c', 'a', 'b']);
  });

  it('round-trips column prefs and drops unknown keys', () => {
    const storage = new MemorySession();
    storage.setItem(
      'senbilan.couples.columns',
      JSON.stringify({ hidden: ['status', 'nope'], order: ['partner', 'ghost', 'creator'] }),
    );
    expect(
      readColumnPrefs(
        storage,
        'senbilan.couples.columns',
        new Set(['creator', 'partner', 'status']),
        new Set(['partner', 'status']),
      ),
    ).toEqual({ hidden: ['status'], order: ['partner', 'creator'] });
    expect(readColumnPrefs(storage, 'missing', new Set(['creator']), new Set(['creator']))).toEqual(
      { hidden: [], order: [] },
    );
  });
});
