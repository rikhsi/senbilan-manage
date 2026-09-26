import { type AppConfig } from '@senbilan/shared/config';

/**
 * Development defaults — used by `nx serve` / `build:development`.
 * Empty `apiBaseUrl` + `proxy.conf.json` avoids CORS in the browser preview.
 * Native Capacitor builds should use production env (absolute API URL).
 */
export const environment: AppConfig = {
  production: false,
  appName: 'Senbilan Manage',
  apiBaseUrl: '',
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
    refreshViaCookie: false,
    sessionIdleMs: 30 * 60 * 1000,
  },
};
