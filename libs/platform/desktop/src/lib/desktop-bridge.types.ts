/**
 * Shape of `window.senbilanDesktop` from Electron preload (`contextBridge`).
 * Keep framework-light so this lib stays boundary-safe.
 */
export interface DesktopBridgeApi {
  readonly minimize: () => Promise<void>;
  readonly maximize: () => Promise<void>;
  readonly close: () => Promise<void>;
  readonly openExternal: (url: string) => Promise<void>;
}

declare global {
  interface Window {
    readonly senbilanDesktop?: DesktopBridgeApi;
  }
}

export const readDesktopBridge = (): DesktopBridgeApi | null => {
  if (typeof globalThis === 'undefined') {
    return null;
  }
  const bridge = (globalThis as Window & typeof globalThis).senbilanDesktop;
  return bridge ?? null;
};
