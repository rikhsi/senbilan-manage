import { provideTranslocoScope } from '@jsverse/transloco';

export const provideUsersI18n = () =>
  provideTranslocoScope({
    scope: 'users',
    loader: {
      en: () => import('./en.json'),
      ru: () => import('./ru.json'),
      uz: () => import('./uz.json'),
    },
  });
