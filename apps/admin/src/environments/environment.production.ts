import { type AppConfig } from '@senbilan/shared/config';

/**
 * Production defaults. Secrets (Sentry DSN, real API URL) are injected at deploy
 * time via CI replace / Azure App Settings / etc. — keep placeholders empty here.
 */
export const environment: AppConfig = {
  production: true,
  appName: 'Senbilan Manage',
  apiBaseUrl: '/api',
  defaultLocale: 'ru',
  availableLocales: ['ru', 'en', 'uz'],
  sentry: {
    enabled: true,
    dsn: '',
    environment: 'production',
    tracesSampleRate: 0.1,
  },
  features: {
    mockApi: false,
    pwa: true,
    commandPalette: true,
  },
  auth: {
    accessTokenStorageKey: 'senbilan.accessToken',
    refreshTokenStorageKey: 'senbilan.refreshToken',
    sessionIdleMs: 30 * 60 * 1000,
  },
};
