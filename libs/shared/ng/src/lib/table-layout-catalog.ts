import { type TableLayoutDefinition } from '@senbilan/shared/util';

/** App-owned list of tables whose column layout can be edited outside the list. */
export abstract class TableLayoutCatalog {
  abstract load(): Promise<readonly TableLayoutDefinition[]>;
  /** Loads column-label scopes for the language that is active now. */
  abstract refreshTranslations(): Promise<void>;
}
