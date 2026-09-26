export const orderColumns = <T extends { key: string }>(
  defs: readonly T[],
  order: readonly string[],
): readonly T[] => {
  if (order.length === 0) {
    return defs;
  }
  const byKey = new Map(defs.map((def) => [def.key, def] as const));
  const seen = new Set<string>();
  const ordered: T[] = [];
  for (const key of order) {
    const def = byKey.get(key);
    if (def) {
      ordered.push(def);
      seen.add(key);
    }
  }
  for (const def of defs) {
    if (!seen.has(def.key)) {
      ordered.push(def);
    }
  }
  return ordered;
};

/** Moves `from` into the slot currently occupied by `to`. */
export const moveColumn = (
  order: readonly string[],
  from: string,
  to: string,
): readonly string[] => {
  const fromIndex = order.indexOf(from);
  const toIndex = order.indexOf(to);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
    return order;
  }
  const next = order.filter((key) => key !== from);
  next.splice(toIndex, 0, from);
  return next;
};

export interface ColumnPrefs {
  readonly hidden: readonly string[];
  readonly order: readonly string[];
}

export interface ColumnPrefsStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const allowedKeys = (value: unknown, allowed: ReadonlySet<string>): readonly string[] | null => {
  if (!Array.isArray(value)) {
    return null;
  }
  return value.filter((item): item is string => typeof item === 'string' && allowed.has(item));
};

export const readColumnPrefs = (
  storage: ColumnPrefsStorage,
  key: string,
  keys: ReadonlySet<string>,
  hideable: ReadonlySet<string>,
): ColumnPrefs => {
  const empty: ColumnPrefs = { hidden: [], order: [] };
  try {
    const raw = storage.getItem(key);
    if (!raw) {
      return empty;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return empty;
    }
    const record = parsed as { hidden?: unknown; order?: unknown };
    return {
      hidden: allowedKeys(record.hidden, hideable) ?? [],
      order: allowedKeys(record.order, keys) ?? [],
    };
  } catch {
    return empty;
  }
};

export const writeColumnPrefs = (
  storage: ColumnPrefsStorage,
  key: string,
  prefs: ColumnPrefs,
): void => {
  try {
    storage.setItem(key, JSON.stringify({ hidden: [...prefs.hidden], order: [...prefs.order] }));
  } catch {
    // Quota or private mode — the in-memory layout still applies for this visit.
  }
};

export const columnPrefsStorage = (): ColumnPrefsStorage | null => {
  try {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage;
  } catch {
    return null;
  }
};

export const loadColumnPrefs = (
  key: string,
  keys: ReadonlySet<string>,
  hideable: ReadonlySet<string>,
): ColumnPrefs => {
  const storage = columnPrefsStorage();
  if (!storage) {
    return { hidden: [], order: [] };
  }
  return readColumnPrefs(storage, key, keys, hideable);
};
