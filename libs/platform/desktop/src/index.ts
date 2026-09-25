/**
 * Electron desktop platform adapters.
 * Browser hosts: {@link provideDesktopPlatform} registers a noop.
 * Electron renderer (preload): registers {@link ElectronDesktopBridge}.
 */
export { type DesktopBridgeApi, readDesktopBridge } from './lib/desktop-bridge.types';
export { ElectronDesktopBridge } from './lib/electron-desktop-bridge';
export { NoopDesktopBridge } from './lib/noop-desktop-bridge';
export { provideDesktopPlatform } from './lib/provide-desktop-platform';
