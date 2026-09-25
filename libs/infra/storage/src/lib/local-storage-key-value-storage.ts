import { Injectable } from '@angular/core';
import { KeyValueStorage, SyncKeyValueStorage } from '@senbilan/core/application';

const readJson = <T>(raw: string | null): T | null => {
  if (raw === null) {
    return null;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

/** Async localStorage adapter for JSON-serialisable preferences. Never store tokens here. */
@Injectable()
export class LocalStorageKeyValueStorage extends KeyValueStorage {
  override async get<T>(key: string): Promise<T | null> {
    return readJson<T>(globalThis.localStorage?.getItem(key) ?? null);
  }

  override async set<T>(key: string, value: T): Promise<void> {
    globalThis.localStorage?.setItem(key, JSON.stringify(value));
  }

  override async remove(key: string): Promise<void> {
    globalThis.localStorage?.removeItem(key);
  }
}

/** Synchronous localStorage for values needed before the first render (theme, locale). */
@Injectable()
export class SyncLocalStorageKeyValueStorage extends SyncKeyValueStorage {
  override get<T>(key: string): T | null {
    return readJson<T>(globalThis.localStorage?.getItem(key) ?? null);
  }

  override set<T>(key: string, value: T): void {
    globalThis.localStorage?.setItem(key, JSON.stringify(value));
  }

  override remove(key: string): void {
    globalThis.localStorage?.removeItem(key);
  }
}
