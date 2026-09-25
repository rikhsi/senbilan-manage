import {
  InjectionToken,
  type EnvironmentProviders,
  makeEnvironmentProviders,
  provideAppInitializer,
  inject,
} from '@angular/core';

/**
 * Runtime application configuration. Build-time defaults come from
 * `environment.*.ts`; optional `assets/config.json` overrides fields at boot
 * (one Docker image → many environments).
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
    /** When true, refresh is expected via httpOnly cookie (withCredentials). */
    readonly refreshViaCookie: boolean;
    readonly sessionIdleMs: number;
  };
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');

/** Mutable holder replaced once by runtime config.json merge. */
export class AppConfigHolder {
  constructor(public value: AppConfig) {}
}

export type AppConfigPatch = Omit<Partial<AppConfig>, 'sentry' | 'features' | 'auth'> & {
  readonly sentry?: Partial<AppConfig['sentry']>;
  readonly features?: Partial<AppConfig['features']>;
  readonly auth?: Partial<AppConfig['auth']>;
};

export const deepMergeConfig = (base: AppConfig, patch: AppConfigPatch): AppConfig => {
  const sentry = { ...base.sentry, ...(patch.sentry ?? {}) };
  const features = { ...base.features, ...(patch.features ?? {}) };
  const auth = { ...base.auth, ...(patch.auth ?? {}) };
  return Object.freeze({
    ...base,
    ...patch,
    sentry,
    features,
    auth,
    availableLocales: patch.availableLocales ?? base.availableLocales,
  });
};

/**
 * Provides APP_CONFIG. Optionally fetches `/assets/config.json` (404 = ignore)
 * and merges over the build-time environment before the app renders routes.
 */
export const provideAppConfig = (
  config: AppConfig,
  options: { readonly runtimeConfigUrl?: string | null } = {},
): EnvironmentProviders => {
  const holder = new AppConfigHolder(Object.freeze(config));
  const url =
    options.runtimeConfigUrl === undefined ? 'assets/config.json' : options.runtimeConfigUrl;

  return makeEnvironmentProviders([
    { provide: AppConfigHolder, useValue: holder },
    {
      provide: APP_CONFIG,
      useFactory: (h: AppConfigHolder): AppConfig => h.value,
      deps: [AppConfigHolder],
    },
    provideAppInitializer(() => {
      const h = inject(AppConfigHolder);
      if (!url) {
        return Promise.resolve();
      }
      return fetch(url, { cache: 'no-store' })
        .then(async (response) => {
          if (!response.ok) {
            return;
          }
          const patch = (await response.json()) as Partial<AppConfig>;
          h.value = deepMergeConfig(h.value, patch);
        })
        .catch(() => undefined);
    }),
  ]);
};
