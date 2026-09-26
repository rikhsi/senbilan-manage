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
  /** Column keys this layout has already seen. New default-hidden keys stay hidden until then. */
  readonly known?: readonly string[];
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
    const record = parsed as { hidden?: unknown; order?: unknown; known?: unknown };
    const known = allowedKeys(record.known, keys);
    return {
      hidden: allowedKeys(record.hidden, hideable) ?? [],
      order: allowedKeys(record.order, keys) ?? [],
      ...(known ? { known } : {}),
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
    storage.setItem(
      key,
      JSON.stringify({
        hidden: [...prefs.hidden],
        order: [...prefs.order],
        ...(prefs.known ? { known: [...prefs.known] } : {}),
      }),
    );
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
  defaults: readonly string[] = [],
): ColumnPrefs => {
  const fallbackHidden = defaults.filter((item) => hideable.has(item));
  const known = [...keys];
  const storage = columnPrefsStorage();
  if (!storage?.getItem(key)) {
    return { hidden: fallbackHidden, order: [], known };
  }
  const stored = readColumnPrefs(storage, key, keys, hideable);
  const hidden = new Set(stored.hidden);
  const seen = stored.known ? new Set(stored.known) : null;
  for (const item of fallbackHidden) {
    const introduced = seen ? !seen.has(item) : !stored.order.includes(item);
    if (introduced) {
      hidden.add(item);
    }
  }
  return { hidden: [...hidden], order: stored.order, known };
};
