import { provideInlineTranslocoScope } from '@senbilan/shared/i18n';

/** Registers the `auth` scope from colocated JSON (bundled, not fetched via HttpClient). */
export const provideAuthI18n = () =>
  provideInlineTranslocoScope('auth', {
    en: () => import('./en.json'),
    ru: () => import('./ru.json'),
    uz: () => import('./uz.json'),
  });
