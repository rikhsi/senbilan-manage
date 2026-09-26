import { type EnvironmentProviders, inject, makeEnvironmentProviders } from '@angular/core';
import { type PermissionKey } from '@senbilan/core/domain';
import {
  LAYOUT_CAN_ACCESS,
  LAYOUT_COMMAND_PALETTE,
  LAYOUT_THEME,
  LAYOUT_USER,
  type LayoutCommandItem,
} from '@senbilan/design-system/layout';
import { APP_THEME_MODE } from '@senbilan/design-system/ui';
import { AuthStore } from '@senbilan/shared/auth';
import { CommandPaletteService } from '@senbilan/shared/command';
import { ShellStore } from '@senbilan/shared/shell';
import { ThemeService, type ThemeMode } from '@senbilan/shared/theme';

/**
 * Bridges AuthStore / ThemeService / ShellStore / CommandPaletteService into layout tokens
 * so `@senbilan/design-system/layout` stays `kind:ui` (no state lib imports).
 */
export const provideLayoutShell = (): EnvironmentProviders =>
  makeEnvironmentProviders([
    {
      provide: LAYOUT_USER,
      useFactory: () => {
        const auth = inject(AuthStore);
        return {
          user: () => {
            const user = auth.user();
            if (!user) {
              return null;
            }
            const displayName = `${user.firstName} ${user.lastName}`.trim() || user.email;
            return { displayName, avatarUrl: user.avatarUrl };
          },
        };
      },
    },
    {
      provide: LAYOUT_CAN_ACCESS,
      useFactory: () => {
        const auth = inject(AuthStore);
        return (permission: string) => auth.can(permission as PermissionKey);
      },
    },
    {
      provide: LAYOUT_THEME,
      useFactory: () => {
        const theme = inject(ThemeService);
        return {
          mode: () => theme.mode(),
          cycleMode: () => theme.cycleMode(),
        };
      },
    },
    {
      provide: APP_THEME_MODE,
      useFactory: () => {
        const theme = inject(ThemeService);
        return {
          mode: () => theme.mode(),
          setMode: (mode: ThemeMode) => theme.setMode(mode),
          cycleMode: () => theme.cycleMode(),
        };
      },
    },
    {
      provide: LAYOUT_COMMAND_PALETTE,
      useFactory: () => {
        const palette = inject(CommandPaletteService);
        const shell = inject(ShellStore);
        const auth = inject(AuthStore);

        const toLayoutItem = (command: {
          id: string;
          label: string;
          labelKey?: string;
          shortcut?: string;
          icon?: string;
          keywords?: readonly string[];
          permission?: PermissionKey;
        }): LayoutCommandItem => ({
          id: command.id,
          label: command.label,
          ...(command.labelKey !== undefined ? { labelKey: command.labelKey } : {}),
          ...(command.shortcut !== undefined ? { shortcut: command.shortcut } : {}),
          ...(command.icon !== undefined ? { icon: command.icon } : {}),
          ...(command.keywords !== undefined ? { keywords: command.keywords } : {}),
          ...(command.permission !== undefined ? { permission: command.permission } : {}),
        });

        return {
          isOpen: shell.commandPaletteOpen,
          open: () => shell.openCommandPalette(),
          close: () => {
            shell.closeCommandPalette();
            palette.close();
          },
          toggle: () => shell.toggleCommandPalette(),
          all: (): readonly LayoutCommandItem[] =>
            palette.filtered((permission) => auth.can(permission)).map(toLayoutItem),
          run: async (id: string) => {
            shell.closeCommandPalette();
            await palette.run(id);
          },
        };
      },
    },
  ]);
