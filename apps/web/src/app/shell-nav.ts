import { type NavigationItem } from '@senbilan/design-system/layout';

/** Primary sidebar / shell navigation for the web app (permission-filtered at runtime). */
export const WEB_SHELL_NAV: readonly NavigationItem[] = [
  {
    id: 'dashboard',
    labelKey: 'nav.dashboard',
    route: '/dashboard',
    icon: 'layout-dashboard',
    permission: 'dashboard:read',
    exact: true,
  },
  {
    id: 'users',
    labelKey: 'nav.users',
    route: '/users',
    icon: 'users',
    permission: 'users:read',
  },
];
