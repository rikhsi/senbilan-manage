import { provideTranslocoScope } from '@jsverse/transloco';

export const provideRolesI18n = () =>
  provideTranslocoScope({
    scope: 'roles',
    loader: {
      en: () => import('./en.json'),
      ru: () => import('./ru.json'),
      uz: () => import('./uz.json'),
    },
  });
