import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SyncKeyValueStorage } from '@senbilan/core/application';
import { orderColumns, UsersStore } from './users.store';

class MemorySyncStorage extends SyncKeyValueStorage {
  private readonly map = new Map<string, unknown>();

  override get<T>(key: string): T | null {
    return (this.map.get(key) as T | undefined) ?? null;
  }

  override set<T>(key: string, value: T): void {
    this.map.set(key, value);
  }

  override remove(key: string): void {
    this.map.delete(key);
  }
}

describe('orderColumns', () => {
  it('reorders by persisted keys and appends unknowns', () => {
    const defs = [{ key: 'a' }, { key: 'b' }, { key: 'c' }];
    expect(orderColumns(defs, ['c', 'a']).map((d) => d.key)).toEqual(['c', 'a', 'b']);
  });

  it('returns defs unchanged when order is empty', () => {
    const defs = [{ key: 'a' }, { key: 'b' }];
    expect(orderColumns(defs, [])).toBe(defs);
  });
});

describe('UsersStore', () => {
  it('persists sort and column visibility across reinits', () => {
    const storage = new MemorySyncStorage();

    TestBed.configureTestingModule({
      providers: [UsersStore, { provide: SyncKeyValueStorage, useValue: storage }],
    });

    const first = TestBed.inject(UsersStore);
    first.setHiddenColumns(['email', 'roles']);
    first.setSort({ key: 'name', direction: 'asc' });
    first.setColumnOrder(['status', 'name', 'email']);
    TestBed.inject(ApplicationRef).tick();

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [UsersStore, { provide: SyncKeyValueStorage, useValue: storage }],
    });

    const second = TestBed.inject(UsersStore);
    expect(second.columnState().hiddenColumns).toEqual(['email', 'roles']);
    expect(second.columnState().columnOrder).toEqual(['status', 'name', 'email']);
    expect(second.sort()).toEqual({ key: 'name', direction: 'asc' });
  });

  it('maps UI sort key into listRequest', () => {
    TestBed.configureTestingModule({
      providers: [UsersStore],
    });
    const store = TestBed.inject(UsersStore);
    store.setSort({ key: 'email', direction: 'desc' });
    expect(store.listRequest().sort).toEqual([{ field: 'email', direction: 'desc' }]);
  });
});
