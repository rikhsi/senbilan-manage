import { type AppIconName } from '@senbilan/design-system/icons';
import { type ThemeMode } from '@senbilan/design-system/tokens';

export const THEME_MODE_ICONS: Readonly<Record<ThemeMode, AppIconName>> = {
  light: 'sun',
  dark: 'moon',
  system: 'monitor',
};

export interface ThemeModeOption {
  readonly mode: ThemeMode;
  readonly icon: AppIconName;
  readonly labelKey: string;
}

export const THEME_MODE_OPTIONS: readonly ThemeModeOption[] = [
  { mode: 'light', icon: 'sun', labelKey: 'common.themeLight' },
  { mode: 'dark', icon: 'moon', labelKey: 'common.themeDark' },
  { mode: 'system', icon: 'monitor', labelKey: 'common.themeSystem' },
];
