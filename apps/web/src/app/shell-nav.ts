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
  {
    id: 'couples',
    labelKey: 'nav.couples',
    route: '/couples',
    icon: 'heart',
    permission: 'couples:read',
  },
  {
    id: 'content',
    labelKey: 'nav.content',
    route: '/content',
    icon: 'copy',
    permission: 'content:read',
  },
  {
    id: 'broadcasts',
    labelKey: 'nav.broadcasts',
    route: '/broadcasts',
    icon: 'bell',
    permission: 'broadcasts:read',
  },
  {
    id: 'media',
    labelKey: 'nav.media',
    route: '/media',
    icon: 'download',
    permission: 'content:read',
  },
  {
    id: 'system',
    labelKey: 'nav.system',
    route: '/system',
    icon: 'info',
    permission: 'dashboard:read',
  },
];
