import { type AppIconName } from '@senbilan/design-system/icons';

export interface NavigationItem {
  readonly id: string;
  /** Transloco key, e.g. `nav.dashboard`. */
  readonly labelKey: string;
  readonly route?: string;
  readonly icon?: AppIconName;
  /** Permission key string; filtered via `LAYOUT_CAN_ACCESS` when provided. */
  readonly permission?: string;
  readonly children?: readonly NavigationItem[];
  /** When true, routerLinkActive uses exact matching. */
  readonly exact?: boolean;
}

export interface BreadcrumbItem {
  readonly labelKey?: string;
  readonly label?: string;
  readonly route?: string;
}

/** Presentational command row for the command palette overlay. */
export interface CommandPaletteItem {
  readonly id: string;
  readonly label: string;
  readonly labelKey?: string;
  readonly shortcut?: string;
  readonly icon?: string;
  readonly keywords?: readonly string[];
}
