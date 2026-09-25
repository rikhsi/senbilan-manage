/**
 * Electron desktop platform adapters — stub until admin-desktop is scaffolded.
 * Prefer `@senbilan/platform/core` `providePlatform()` for browser hosts unless
 * you explicitly want the desktop noop bridge.
 */
export { type DesktopBridgeApi } from './lib/desktop-bridge.types';
export { NoopDesktopBridge } from './lib/noop-desktop-bridge';
export { provideDesktopPlatform } from './lib/provide-desktop-platform';
