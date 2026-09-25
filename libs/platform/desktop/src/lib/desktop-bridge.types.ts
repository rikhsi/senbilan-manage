/**
 * Shape of the future preload-exposed API (`contextBridge`).
 * Kept framework-light so this lib can stay `kind:util` until Electron lands.
 */
export interface DesktopBridgeApi {
  readonly minimize: () => Promise<void>;
  readonly maximize: () => Promise<void>;
  readonly close: () => Promise<void>;
  readonly openExternal: (url: string) => Promise<void>;
}
