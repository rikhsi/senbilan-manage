import { type AppConfig } from '@senbilan/shared/config';

/** Development defaults — used by `nx serve` / `build:development`.
 * `apiBaseUrl` is empty so requests stay same-origin (`/admin/...`, `/v1/...`)
 * and are forwarded by `proxy.conf.json` (avoids CORS on localhost).
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
    mockApi: false,
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
