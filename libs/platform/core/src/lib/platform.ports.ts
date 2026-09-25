import { Injectable } from '@angular/core';

export type PlatformKind = 'web' | 'capacitor' | 'electron';

/**
 * Runtime platform detection. Application code depends on this port rather than
 * reading `userAgent` or Capacitor globals directly.
 */
@Injectable()
export abstract class PlatformService {
  abstract readonly kind: PlatformKind;
  abstract readonly isWeb: boolean;
  abstract readonly isCapacitor: boolean;
  abstract readonly isElectron: boolean;
  abstract readonly isMobileViewport: boolean;
}

/** Optional desktop window controls — Electron adapter will implement later. */
@Injectable()
export abstract class DesktopService {
  abstract readonly isAvailable: boolean;
  abstract minimize(): Promise<void>;
  abstract maximize(): Promise<void>;
  abstract close(): Promise<void>;
  abstract openExternal(url: string): Promise<void>;
}

/** Optional haptic feedback (Capacitor). */
@Injectable()
export abstract class HapticsAdapter {
  abstract impact(style?: 'light' | 'medium' | 'heavy'): Promise<void>;
  abstract notification(type?: 'success' | 'warning' | 'error'): Promise<void>;
}

/** Optional status-bar control (Capacitor). */
@Injectable()
export abstract class StatusBarAdapter {
  abstract setStyle(style: 'light' | 'dark' | 'default'): Promise<void>;
  abstract show(): Promise<void>;
  abstract hide(): Promise<void>;
}
