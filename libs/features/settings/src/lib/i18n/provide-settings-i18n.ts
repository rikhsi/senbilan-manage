import { provideTranslocoScope } from '@jsverse/transloco';

export const provideSettingsI18n = () =>
  provideTranslocoScope({
    scope: 'settings',
    loader: {
      en: () => import('./en.json'),
      ru: () => import('./ru.json'),
      uz: () => import('./uz.json'),
    },
  });
