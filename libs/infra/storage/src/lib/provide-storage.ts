import { type EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import {
  Clock,
  IdGenerator,
  KeyValueStorage,
  SessionStorage,
  SyncKeyValueStorage,
} from '@senbilan/core/application';
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
}

export const provideStorage = (options: ProvideStorageOptions = {}): EnvironmentProviders => {
  const keyValueBackend = options.keyValueBackend ?? 'indexeddb';
  return makeEnvironmentProviders([
    InMemorySessionStorage,
    LocalStorageKeyValueStorage,
    SyncLocalStorageKeyValueStorage,
    IndexedDbKeyValueStorage,
    SystemClock,
    CryptoIdGenerator,
    { provide: SessionStorage, useExisting: InMemorySessionStorage },
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
