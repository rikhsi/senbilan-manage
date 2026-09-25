import { provideTranslocoScope } from '@jsverse/transloco';

export const provideDashboardI18n = () =>
  provideTranslocoScope({
    scope: 'dashboard',
    loader: {
      en: () => import('./en.json'),
      ru: () => import('./ru.json'),
      uz: () => import('./uz.json'),
    },
  });
