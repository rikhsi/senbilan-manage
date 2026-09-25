import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { type EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { APP_CONFIG, type AppConfig } from '@senbilan/shared/config';

/** Minimal APP_CONFIG suitable for TestBed / Vitest component tests. */
export const TESTING_APP_CONFIG: AppConfig = {
  production: false,
  appName: 'Senbilan Test',
  apiBaseUrl: 'http://localhost/api',
  defaultLocale: 'ru',
  availableLocales: ['ru', 'en', 'uz'],
  sentry: {
    enabled: false,
    dsn: '',
    environment: 'development',
    tracesSampleRate: 0,
  },
  features: {
    mockApi: true,
    pwa: false,
    commandPalette: true,
  },
  auth: {
    accessTokenStorageKey: 'test.accessToken',
    refreshTokenStorageKey: 'test.refreshToken',
    refreshViaCookie: false,
    sessionIdleMs: 30 * 60 * 1000,
  },
};

export type ProvideTestingPlatformOptions = {
  readonly config?: Partial<AppConfig>;
};

/**
 * TestBed / Vitest environment providers: mock APP_CONFIG, noop animations,
 * and HttpClientTestingModule equivalents.
 */
export const provideTestingPlatform = (
  options: ProvideTestingPlatformOptions = {},
): EnvironmentProviders => {
  const config: AppConfig = {
    ...TESTING_APP_CONFIG,
    ...options.config,
    sentry: { ...TESTING_APP_CONFIG.sentry, ...options.config?.sentry },
    features: { ...TESTING_APP_CONFIG.features, ...options.config?.features },
    auth: { ...TESTING_APP_CONFIG.auth, ...options.config?.auth },
    availableLocales: options.config?.availableLocales ?? TESTING_APP_CONFIG.availableLocales,
  };

  return makeEnvironmentProviders([
    { provide: APP_CONFIG, useValue: Object.freeze(config) },
    provideNoopAnimations(),
    provideHttpClient(),
    provideHttpClientTesting(),
  ]);
};
