import { type AppConfig } from '@senbilan/shared/config';

/**
 * Production defaults. Secrets (Sentry DSN) are injected at deploy time.
 * Browser talks to the API host directly (no Vite proxy in static builds).
 */
export const environment: AppConfig = {
  production: true,
  appName: 'Senbilan Manage',
  apiBaseUrl: 'https://api.senbilan.uz',
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
    refreshViaCookie: false,
    sessionIdleMs: 30 * 60 * 1000,
  },
};
