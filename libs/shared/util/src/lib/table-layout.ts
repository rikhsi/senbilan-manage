import { columnPrefsStorage, loadColumnPrefs, writeColumnPrefs } from './column-order';

export interface TableLayoutColumn {
  readonly key: string;
  readonly labelKey: string;
  readonly hideable: boolean;
}

export interface TableLayoutSnapshot {
  readonly hidden: readonly string[];
  readonly order: readonly string[];
}

/** One list table whose column visibility and order are stored in the browser. */
export interface TableLayoutDefinition {
  readonly id: string;
  readonly labelKey: string;
  readonly columns: readonly TableLayoutColumn[];
  readonly defaultHidden: readonly string[];
  read(): TableLayoutSnapshot;
  write(snapshot: TableLayoutSnapshot): void;
}

export const sessionColumnLayout = (options: {
  readonly id: string;
  readonly labelKey: string;
  readonly storageKey: string;
  readonly columns: readonly TableLayoutColumn[];
  readonly defaultHidden: readonly string[];
}): TableLayoutDefinition => {
  const keys = new Set(options.columns.map((column) => column.key));
  const hideable = new Set(
    options.columns.filter((column) => column.hideable).map((column) => column.key),
  );
  return {
    id: options.id,
    labelKey: options.labelKey,
    columns: options.columns,
    defaultHidden: options.defaultHidden,
    read: () => {
      const prefs = loadColumnPrefs(options.storageKey, keys, hideable, options.defaultHidden);
      return { hidden: prefs.hidden, order: prefs.order };
    },
    write: (snapshot) => {
      const storage = columnPrefsStorage();
      if (!storage) {
        return;
      }
      writeColumnPrefs(storage, options.storageKey, {
        hidden: snapshot.hidden.filter((key) => hideable.has(key)),
        order: snapshot.order.filter((key) => keys.has(key)),
        known: [...keys],
      });
    },
  };
};
