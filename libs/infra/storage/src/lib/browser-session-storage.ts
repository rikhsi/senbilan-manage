import { inject, Injectable } from '@angular/core';
import { SessionStorage } from '@senbilan/core/application';
import { APP_CONFIG } from '@senbilan/shared/config';

/**
 * Persists tokens so `RestoreSessionUseCase` can rehydrate after reload.
 *
 * - Access token → `localStorage` (key from `APP_CONFIG.auth.accessTokenStorageKey`)
 * - Refresh token → `localStorage` only when `refreshViaCookie` is false
 *   (when true, refresh lives in an httpOnly cookie — see ADR 0005)
 */
@Injectable()
export class BrowserSessionStorage extends SessionStorage {
  private readonly config = inject(APP_CONFIG);

  override getAccessToken(): string | null {
    return this.read(this.config.auth.accessTokenStorageKey);
  }

  override setAccessToken(token: string | null): void {
    this.write(this.config.auth.accessTokenStorageKey, token);
  }

  override getRefreshToken(): string | null {
    if (this.config.auth.refreshViaCookie) {
      return null;
    }
    return this.read(this.config.auth.refreshTokenStorageKey);
  }

  override setRefreshToken(token: string | null): void {
    if (this.config.auth.refreshViaCookie) {
      this.write(this.config.auth.refreshTokenStorageKey, null);
      return;
    }
    this.write(this.config.auth.refreshTokenStorageKey, token);
  }

  override clear(): void {
    this.write(this.config.auth.accessTokenStorageKey, null);
    this.write(this.config.auth.refreshTokenStorageKey, null);
  }

  private read(key: string): string | null {
    try {
      const value = globalThis.localStorage?.getItem(key) ?? null;
      return value && value.trim().length > 0 ? value : null;
    } catch {
      return null;
    }
  }

  private write(key: string, value: string | null): void {
    try {
      if (value === null || value.trim().length === 0) {
        globalThis.localStorage?.removeItem(key);
        return;
      }
      globalThis.localStorage?.setItem(key, value);
    } catch {
      // Private mode / quota — best-effort; session lasts until reload only.
    }
  }
}
