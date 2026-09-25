import { type EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideEventPlugins } from '@taiga-ui/event-plugins';
import { type IconMap, provideIcons } from '@senbilan/design-system/icons';

/**
 * One-call setup for the design system: icon registry (+ Taiga icon bridge) and
 * Taiga event plugins required by `tuiHint`/`tuiDropdown`. Add to `app.config.ts`
 * of every app (web, mobile, desktop).
 */
export const provideDesignSystem = (...extraIconSets: readonly IconMap[]): EnvironmentProviders =>
  makeEnvironmentProviders([...provideIcons(...extraIconSets), ...provideEventPlugins()]);
