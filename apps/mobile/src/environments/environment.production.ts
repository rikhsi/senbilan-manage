import { type AppConfig } from '@senbilan/shared/config';

/** Production / Capacitor — call the API host directly. */
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
    commandPalette: false,
  },
  auth: {
    accessTokenStorageKey: 'senbilan.accessToken',
    refreshTokenStorageKey: 'senbilan.refreshToken',
    refreshViaCookie: false,
    sessionIdleMs: 30 * 60 * 1000,
  },
};
