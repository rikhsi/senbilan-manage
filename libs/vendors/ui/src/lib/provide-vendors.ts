import { type EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideEventPlugins } from '@taiga-ui/event-plugins';
import { provideVendorIcons } from './icons/provide-vendor-icons';

/**
 * Vendor kit setup (Taiga / Ionic bridges): icon aliases + event plugins for
 * `tuiHint` / `tuiDropdown`. Call from apps next to `provideDesignSystem()`.
 *
 * Pure design-system code must not depend on this — vendors are disposable.
 */
export const provideVendors = (): EnvironmentProviders =>
  makeEnvironmentProviders([...provideVendorIcons(), ...provideEventPlugins()]);
