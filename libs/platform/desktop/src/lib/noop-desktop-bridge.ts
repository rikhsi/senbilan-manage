import { Injectable } from '@angular/core';
import { DesktopService } from '@senbilan/platform/core';
import { type DesktopBridgeApi } from './desktop-bridge.types';

/**
 * Browser / test fallback when Electron preload is absent.
 *
 * @see apps/admin-desktop/README.md
 */
@Injectable()
export class NoopDesktopBridge extends DesktopService implements DesktopBridgeApi {
  override readonly isAvailable = false;

  override async minimize(): Promise<void> {
    /* Electron IPC not wired */
  }

  override async maximize(): Promise<void> {
    /* Electron IPC not wired */
  }

  override async close(): Promise<void> {
    /* Electron IPC not wired */
  }

  override async openExternal(url: string): Promise<void> {
    globalThis.open?.(url, '_blank', 'noopener,noreferrer');
  }
}
