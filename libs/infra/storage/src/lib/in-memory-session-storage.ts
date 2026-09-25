import { Injectable } from '@angular/core';
import { SessionStorage } from '@senbilan/core/application';

/**
 * Access (and optional refresh) tokens live in process memory only.
 * Refresh is expected to be an httpOnly cookie in production; the in-memory
 * refresh slot exists for mock/dev backends that return a body token.
 */
@Injectable()
export class InMemorySessionStorage extends SessionStorage {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  override getAccessToken(): string | null {
    return this.accessToken;
  }

  override setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  override getRefreshToken(): string | null {
    return this.refreshToken;
  }

  override setRefreshToken(token: string | null): void {
    this.refreshToken = token;
  }

  override clear(): void {
    this.accessToken = null;
    this.refreshToken = null;
  }
}
