import { provideTranslocoScope } from '@jsverse/transloco';

export const providePermissionsI18n = () =>
  provideTranslocoScope({
    scope: 'permissions',
    loader: {
      en: () => import('./en.json'),
      ru: () => import('./ru.json'),
      uz: () => import('./uz.json'),
    },
  });
