export interface CatalogPick {
  readonly id: string;
  readonly label: string;
}

export type CatalogPickKind = 'user' | 'couple';

export interface CatalogPickOutcome {
  /** False when the drawer was dismissed without applying. */
  readonly applied: boolean;
  readonly pick: CatalogPick | null;
}

/**
 * Opens another catalog list so a filter can choose one record.
 * Implemented in the app composition root, which can mount feature pages.
 */
export abstract class CatalogPicker {
  abstract pick(kind: CatalogPickKind, current: CatalogPick | null): Promise<CatalogPickOutcome>;
}
