import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AuthRepository, SessionStorage, UnauthorizedError } from '@senbilan/core/application';
import { APP_CONFIG, type AppConfig } from '@senbilan/shared/config';
import { MockDataStore, resetMockDb } from '../mock-data.store';
import { MockAuthRepository } from './mock-auth.repository';

class MemorySessionStorage extends SessionStorage {
  private access: string | null = null;
  private refresh: string | null = null;

  override getAccessToken(): string | null {
    return this.access;
  }
  override setAccessToken(token: string | null): void {
    this.access = token;
  }
  override getRefreshToken(): string | null {
    return this.refresh;
  }
  override setRefreshToken(token: string | null): void {
    this.refresh = token;
  }
  override clear(): void {
    this.access = null;
    this.refresh = null;
  }
}

const config = (refreshViaCookie: boolean): AppConfig => ({
  production: false,
  appName: 'test',
  apiBaseUrl: '/api',
  defaultLocale: 'ru',
  availableLocales: ['ru', 'en', 'uz'],
  sentry: { enabled: false, dsn: '', environment: 'development', tracesSampleRate: 0 },
  features: { mockApi: true, pwa: false, commandPalette: true },
  auth: {
    accessTokenStorageKey: 't.access',
    refreshTokenStorageKey: 't.refresh',
    refreshViaCookie,
    sessionIdleMs: 60_000,
  },
});

describe('MockAuthRepository refreshViaCookie', () => {
  beforeEach(() => {
    resetMockDb();
    TestBed.configureTestingModule({
      providers: [
        MockDataStore,
        MockAuthRepository,
        { provide: AuthRepository, useExisting: MockAuthRepository },
        { provide: SessionStorage, useClass: MemorySessionStorage },
        { provide: APP_CONFIG, useValue: config(true) },
      ],
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('keeps refresh only in the httpOnly jar and refreshes without a body token', async () => {
    const auth = TestBed.inject(MockAuthRepository);
    const storage = TestBed.inject(SessionStorage);
    const store = TestBed.inject(MockDataStore);

    const result = await auth.login({
      phone: '+998901234567',
      password: 'password123',
    });

    expect(result.tokens.refreshToken).toBeUndefined();
    expect(store.getHttpOnlyRefresh()).toBeTruthy();

    storage.setAccessToken(result.tokens.accessToken);
    expect(storage.getRefreshToken()).toBeNull();

    const refreshed = await auth.refresh();
    expect(refreshed.accessToken).toBeTruthy();
    expect(refreshed.refreshToken).toBeUndefined();
    expect(store.getHttpOnlyRefresh()).toBeTruthy();
  });

  it('rejects refresh when the cookie jar is empty', async () => {
    const auth = TestBed.inject(MockAuthRepository);
    await expect(auth.refresh()).rejects.toBeInstanceOf(UnauthorizedError);
  });
});
