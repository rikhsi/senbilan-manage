import { type AppConfig } from '@senbilan/shared/config';

/** Development defaults — used by `nx serve` / `build:development`. */
export const environment: AppConfig = {
  production: false,
  appName: 'Senbilan Manage',
  apiBaseUrl: 'https://api.senbilan.uz',
  defaultLocale: 'ru',
  availableLocales: ['ru', 'en', 'uz'],
  sentry: {
    enabled: false,
    dsn: '',
    environment: 'development',
    tracesSampleRate: 0,
  },
  features: {
    mockApi: false,
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
