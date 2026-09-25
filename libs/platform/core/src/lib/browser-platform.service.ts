import { Injectable } from '@angular/core';
import { DesktopService, PlatformService, type PlatformKind } from './platform.ports';

const detectKind = (): PlatformKind => {
  const win = globalThis as typeof globalThis & {
    Capacitor?: { isNativePlatform?: () => boolean };
    electron?: unknown;
    process?: { versions?: { electron?: string } };
  };

  if (win.Capacitor?.isNativePlatform?.() === true) {
    return 'capacitor';
  }
  if (win.electron !== undefined || win.process?.versions?.electron !== undefined) {
    return 'electron';
  }
  const ua = globalThis.navigator?.userAgent ?? '';
  if (/Electron/i.test(ua)) {
    return 'electron';
  }
  return 'web';
};

@Injectable()
export class BrowserPlatformService extends PlatformService {
  override readonly kind: PlatformKind = detectKind();
  override readonly isWeb = this.kind === 'web';
  override readonly isCapacitor = this.kind === 'capacitor';
  override readonly isElectron = this.kind === 'electron';

  override get isMobileViewport(): boolean {
    return typeof globalThis.matchMedia === 'function'
      ? globalThis.matchMedia('(max-width: 768px)').matches
      : false;
  }
}

/** No-op desktop controls for browser / Capacitor hosts. */
@Injectable()
export class NoopDesktopService extends DesktopService {
  override readonly isAvailable = false;

  override async minimize(): Promise<void> {
    /* noop */
  }

  override async maximize(): Promise<void> {
    /* noop */
  }

  override async close(): Promise<void> {
    /* noop */
  }

  override async openExternal(url: string): Promise<void> {
    globalThis.open?.(url, '_blank', 'noopener,noreferrer');
  }
}
