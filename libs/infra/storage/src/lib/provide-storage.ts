import { type EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import {
  Clock,
  IdGenerator,
  KeyValueStorage,
  SessionStorage,
  SyncKeyValueStorage,
} from '@senbilan/core/application';
import { BrowserSessionStorage } from './browser-session-storage';
import { IndexedDbKeyValueStorage } from './indexed-db-key-value-storage';
import { InMemorySessionStorage } from './in-memory-session-storage';
import {
  LocalStorageKeyValueStorage,
  SyncLocalStorageKeyValueStorage,
} from './local-storage-key-value-storage';
import { CryptoIdGenerator, SystemClock } from './system-clock';

export interface ProvideStorageOptions {
  /** Default: IndexedDB. Pass `'local'` for an async localStorage backend. */
  readonly keyValueBackend?: 'indexeddb' | 'local';
  /**
   * Default: browser (localStorage) so reload restores the session.
   * Pass `'memory'` for tests / ephemeral sessions.
   */
  readonly sessionBackend?: 'browser' | 'memory';
}

export const provideStorage = (options: ProvideStorageOptions = {}): EnvironmentProviders => {
  const keyValueBackend = options.keyValueBackend ?? 'indexeddb';
  const sessionBackend = options.sessionBackend ?? 'browser';
  return makeEnvironmentProviders([
    BrowserSessionStorage,
    InMemorySessionStorage,
    LocalStorageKeyValueStorage,
    SyncLocalStorageKeyValueStorage,
    IndexedDbKeyValueStorage,
    SystemClock,
    CryptoIdGenerator,
    {
      provide: SessionStorage,
      useExisting: sessionBackend === 'memory' ? InMemorySessionStorage : BrowserSessionStorage,
    },
    { provide: SyncKeyValueStorage, useExisting: SyncLocalStorageKeyValueStorage },
    { provide: Clock, useExisting: SystemClock },
    { provide: IdGenerator, useExisting: CryptoIdGenerator },
    {
      provide: KeyValueStorage,
      useExisting:
        keyValueBackend === 'local' ? LocalStorageKeyValueStorage : IndexedDbKeyValueStorage,
    },
  ]);
};
