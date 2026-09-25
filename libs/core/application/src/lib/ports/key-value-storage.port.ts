/**
 * Persistent key/value storage for user preferences (theme, language, table
 * layouts, sidebar state). Values must be JSON-serialisable. Never store tokens here.
 */
export abstract class KeyValueStorage {
  abstract get<T>(key: string): Promise<T | null>;
  abstract set<T>(key: string, value: T): Promise<void>;
  abstract remove(key: string): Promise<void>;
}

/** Synchronous variant for values needed before the first render (theme, locale). */
export abstract class SyncKeyValueStorage {
  abstract get<T>(key: string): T | null;
  abstract set<T>(key: string, value: T): void;
  abstract remove(key: string): void;
}
