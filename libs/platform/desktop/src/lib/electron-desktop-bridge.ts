import { Injectable } from '@angular/core';
import { DesktopService } from '@senbilan/platform/core';
import { readDesktopBridge, type DesktopBridgeApi } from './desktop-bridge.types';

/**
 * Renderer adapter for Electron preload (`window.senbilanDesktop`).
 * Falls back to no-ops when the bridge is absent (browser / tests).
 */
@Injectable()
export class ElectronDesktopBridge extends DesktopService {
  private readonly bridge: DesktopBridgeApi | null = readDesktopBridge();

  override readonly isAvailable = this.bridge !== null;

  override async minimize(): Promise<void> {
    await this.bridge?.minimize();
  }

  override async maximize(): Promise<void> {
    await this.bridge?.maximize();
  }

  override async close(): Promise<void> {
    await this.bridge?.close();
  }

  override async openExternal(url: string): Promise<void> {
    if (this.bridge) {
      await this.bridge.openExternal(url);
      return;
    }
    globalThis.open?.(url, '_blank', 'noopener,noreferrer');
  }
}
