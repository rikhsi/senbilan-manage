import { type EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { DesktopService } from '@senbilan/platform/core';
import { NoopDesktopBridge } from './noop-desktop-bridge';

/**
 * Registers desktop bridge adapters. Browser hosts get {@link NoopDesktopBridge}.
 * Electron admin-desktop will swap in a preload-backed implementation.
 */
export const provideDesktopPlatform = (): EnvironmentProviders =>
  makeEnvironmentProviders([
    NoopDesktopBridge,
    { provide: DesktopService, useExisting: NoopDesktopBridge },
  ]);
