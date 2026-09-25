import { type EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { DesktopService } from '@senbilan/platform/core';
import { readDesktopBridge } from './desktop-bridge.types';
import { ElectronDesktopBridge } from './electron-desktop-bridge';
import { NoopDesktopBridge } from './noop-desktop-bridge';

/**
 * Registers {@link DesktopService}.
 * - Electron renderer (preload present) → {@link ElectronDesktopBridge}
 * - Browser / tests → {@link NoopDesktopBridge}
 *
 * Call **after** `providePlatform()` so this overrides the core noop.
 */
export const provideDesktopPlatform = (): EnvironmentProviders => {
  const useElectron = readDesktopBridge() !== null;
  return makeEnvironmentProviders(
    useElectron
      ? [ElectronDesktopBridge, { provide: DesktopService, useExisting: ElectronDesktopBridge }]
      : [NoopDesktopBridge, { provide: DesktopService, useExisting: NoopDesktopBridge }],
  );
};
