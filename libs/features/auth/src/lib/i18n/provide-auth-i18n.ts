import { provideTranslocoScope } from '@jsverse/transloco';

export const provideAuthI18n = () =>
  provideTranslocoScope({
    scope: 'auth',
    loader: {
      en: () => import('./en.json'),
      ru: () => import('./ru.json'),
      uz: () => import('./uz.json'),
    },
  });
