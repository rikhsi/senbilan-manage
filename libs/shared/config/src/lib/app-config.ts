import { InjectionToken, type EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

/**
 * Runtime application configuration. Values come from `environment.*.ts` via
 * `fileReplacements` (dev/prod) — never hardcode URLs, Sentry DSNs, or feature
 * flags inside features.
 */
export interface AppConfig {
  readonly production: boolean;
  readonly appName: string;
  readonly apiBaseUrl: string;
  readonly defaultLocale: 'ru' | 'en' | 'uz';
  readonly availableLocales: readonly ('ru' | 'en' | 'uz')[];
  readonly sentry: {
    readonly enabled: boolean;
    readonly dsn: string;
    readonly environment: 'development' | 'staging' | 'production';
    readonly tracesSampleRate: number;
  };
  readonly features: {
    readonly mockApi: boolean;
    readonly pwa: boolean;
    readonly commandPalette: boolean;
  };
  readonly auth: {
    readonly accessTokenStorageKey: string;
    readonly refreshTokenStorageKey: string;
    readonly sessionIdleMs: number;
  };
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');

export const provideAppConfig = (config: AppConfig): EnvironmentProviders =>
  makeEnvironmentProviders([{ provide: APP_CONFIG, useValue: Object.freeze(config) }]);
