import { type PermissionKey } from '@senbilan/core/domain';
import { type AppIconName } from '@senbilan/design-system/icons';

export interface NavigationItem {
  readonly id: string;
  /** Transloco key, e.g. `nav.dashboard`. */
  readonly labelKey: string;
  readonly route?: string;
  readonly icon?: AppIconName;
  readonly permission?: PermissionKey;
  readonly children?: readonly NavigationItem[];
  /** When true, routerLinkActive uses exact matching. */
  readonly exact?: boolean;
}

export interface BreadcrumbItem {
  readonly labelKey?: string;
  readonly label?: string;
  readonly route?: string;
}
