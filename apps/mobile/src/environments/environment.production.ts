import { type AppConfig } from '@senbilan/shared/config';

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
    commandPalette: false,
  },
  auth: {
    accessTokenStorageKey: 'senbilan.accessToken',
    refreshTokenStorageKey: 'senbilan.refreshToken',
    refreshViaCookie: true,
    sessionIdleMs: 30 * 60 * 1000,
  },
};
