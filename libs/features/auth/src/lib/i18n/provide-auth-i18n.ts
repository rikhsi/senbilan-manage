import { provideTranslocoScope } from '@jsverse/transloco';

/** Registers the `auth` scope from colocated JSON (bundled, not fetched via HttpClient). */
export const provideAuthI18n = () =>
  provideTranslocoScope({
    scope: 'auth',
    loader: {
      en: () => import('./en.json'),
      ru: () => import('./ru.json'),
      uz: () => import('./uz.json'),
    },
  });
