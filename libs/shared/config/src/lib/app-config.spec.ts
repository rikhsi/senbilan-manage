import { deepMergeConfig, type AppConfig } from './app-config';

const base: AppConfig = {
  production: false,
  appName: 'Senbilan Manage',
  apiBaseUrl: 'http://localhost:3000/api',
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
    accessTokenStorageKey: 'senbilan.accessToken',
    refreshTokenStorageKey: 'senbilan.refreshToken',
    refreshViaCookie: true,
    sessionIdleMs: 30 * 60 * 1000,
  },
};

describe('deepMergeConfig', () => {
  it('overrides nested sentry/features/auth without dropping siblings', () => {
    const merged = deepMergeConfig(base, {
      apiBaseUrl: '/api',
      sentry: { enabled: true, dsn: 'https://example.test/1' },
      features: { mockApi: false },
    });

    expect(merged.apiBaseUrl).toBe('/api');
    expect(merged.sentry.enabled).toBe(true);
    expect(merged.sentry.dsn).toBe('https://example.test/1');
    expect(merged.sentry.environment).toBe('development');
    expect(merged.features.mockApi).toBe(false);
    expect(merged.features.commandPalette).toBe(true);
    expect(merged.auth.refreshViaCookie).toBe(true);
  });
});
