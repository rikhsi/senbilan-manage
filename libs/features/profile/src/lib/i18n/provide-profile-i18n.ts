import { provideTranslocoScope } from '@jsverse/transloco';

export const provideProfileI18n = () =>
  provideTranslocoScope({
    scope: 'profile',
    loader: {
      en: () => import('./en.json'),
      ru: () => import('./ru.json'),
      uz: () => import('./uz.json'),
    },
  });
