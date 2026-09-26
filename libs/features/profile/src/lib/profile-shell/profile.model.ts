import { type AppIconName } from '@senbilan/design-system/icons';

/** Horizontal profile sections — add new entries here as the feature grows. */
export type ProfileSectionId = 'info' | 'settings' | 'tables';

export interface ProfileNavItem {
  readonly id: ProfileSectionId;
  readonly labelKey: string;
  readonly route: ProfileSectionId;
  readonly icon: AppIconName;
}

export const PROFILE_NAV_ITEMS: readonly ProfileNavItem[] = [
  {
    id: 'settings',
    labelKey: 'profile.nav.settings',
    route: 'settings',
    icon: 'settings',
  },
  {
    id: 'tables',
    labelKey: 'profile.nav.tables',
    route: 'tables',
    icon: 'columns',
  },
];

/** Read-only snapshot shown on the info section (expand fields later). */
export interface ProfileInfoView {
  readonly firstName: string;
  readonly middleName: string;
  readonly lastName: string;
  readonly roleLabel: string;
  readonly avatarUrl: string | null;
  readonly displayName: string;
}
