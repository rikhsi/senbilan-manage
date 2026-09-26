import { InjectionToken } from '@angular/core';
import { type ThemeMode } from '@senbilan/design-system/tokens';

/** App-provided bridge so DS UI never imports `@senbilan/shared/theme`. */
export interface AppThemeModeBridge {
  mode(): ThemeMode;
  setMode(mode: ThemeMode): void;
  cycleMode(): void;
}

export const APP_THEME_MODE = new InjectionToken<AppThemeModeBridge>('APP_THEME_MODE');
