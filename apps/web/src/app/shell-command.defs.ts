import { type AppIconName } from '@senbilan/design-system/icons';

export type ShellActionCommandKind = 'route' | 'theme' | 'logout';

export interface ShellActionCommandDef {
  readonly id: string;
  readonly labelKey: string;
  readonly icon: AppIconName;
  readonly keywords: readonly string[];
  readonly kind: ShellActionCommandKind;
  readonly route?: string;
}

/** Non-nav command palette entries (actions bound in the shell layout). */
export const WEB_SHELL_ACTION_COMMANDS: readonly ShellActionCommandDef[] = [
  {
    id: 'action.profile',
    labelKey: 'common.profile',
    icon: 'user',
    keywords: ['account', 'me'],
    kind: 'route',
    route: '/profile',
  },
  {
    id: 'action.theme',
    labelKey: 'common.cycleTheme',
    icon: 'sun',
    keywords: ['dark', 'light', 'theme'],
    kind: 'theme',
  },
  {
    id: 'action.logout',
    labelKey: 'common.logout',
    icon: 'log-out',
    keywords: ['sign out', 'exit'],
    kind: 'logout',
  },
];
