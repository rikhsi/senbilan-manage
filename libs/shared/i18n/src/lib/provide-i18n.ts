import {
  ENVIRONMENT_INITIALIZER,
  type EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
} from '@angular/core';
import { provideTransloco, provideTranslocoScope, TranslocoService } from '@jsverse/transloco';
import { APP_CONFIG } from '@senbilan/shared/config';
import { AssetsTranslocoLoader } from './assets-transloco.loader';

export type AppLocale = 'ru' | 'en' | 'uz';

export interface I18nConfig {
  readonly defaultLocale?: AppLocale;
  readonly availableLocales?: readonly AppLocale[];
  /** Extra Transloco scopes beyond `common` (features usually register their own). */
  readonly scopes?: readonly string[];
  readonly prodMode?: boolean;
}

/**
 * Wires Transloco with ru/en/uz, default language from `APP_CONFIG` (or override),
 * and a `common` scope loaded from `assets/i18n/common.{lang}.json`.
 *
 * Root messages live in `assets/i18n/{lang}.json`. Feature libraries ship additional
 * scopes (e.g. `users.ru.json`) under the same folder and call
 * `provideTranslocoScope('users')` from their routes/providers.
 *
 * Requires `provideHttpClient()` in the application providers.
 */
export const provideI18n = (config: I18nConfig = {}): EnvironmentProviders => {
  const availableLangs = [...(config.availableLocales ?? (['ru', 'en', 'uz'] as const))];
  const defaultLang = config.defaultLocale ?? 'ru';

  return makeEnvironmentProviders([
    ...provideTransloco({
      config: {
        availableLangs,
        defaultLang,
        fallbackLang: 'en',
        reRenderOnLangChange: true,
        prodMode: config.prodMode ?? false,
        missingHandler: {
          useFallbackTranslation: true,
          logMissingKey: true,
        },
      },
      loader: AssetsTranslocoLoader,
    }),
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: (): void => {
        const appConfig = inject(APP_CONFIG, { optional: true });
        const transloco = inject(TranslocoService);
        const lang = config.defaultLocale ?? appConfig?.defaultLocale ?? defaultLang;
        transloco.setDefaultLang(lang);
        transloco.setActiveLang(lang);
      },
    },
    ...provideTranslocoScope('common'),
    ...(config.scopes ?? []).flatMap((scope) => provideTranslocoScope(scope)),
  ]);
};
