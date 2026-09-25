import { Injectable } from '@angular/core';
import { KeyValueStorage } from '@senbilan/core/application';
import { del, get, set } from 'idb-keyval';

/** IndexedDB-backed preferences via idb-keyval. Never store tokens here. */
@Injectable()
export class IndexedDbKeyValueStorage extends KeyValueStorage {
  override async get<T>(key: string): Promise<T | null> {
    const value = await get<T>(key);
    return value === undefined ? null : value;
  }

  override async set<T>(key: string, value: T): Promise<void> {
    await set(key, value);
  }

  override async remove(key: string): Promise<void> {
    await del(key);
  }
}
