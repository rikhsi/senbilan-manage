import { type EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { type IconMap, provideIcons } from '@senbilan/design-system/icons';

/**
 * Pure design-system setup (icon registry only). Vendor kits (Taiga / Ionic)
 * are wired separately via `provideVendors()` from `@senbilan/vendors/ui`.
 */
export const provideDesignSystem = (...extraIconSets: readonly IconMap[]): EnvironmentProviders =>
  makeEnvironmentProviders([...provideIcons(...extraIconSets)]);
