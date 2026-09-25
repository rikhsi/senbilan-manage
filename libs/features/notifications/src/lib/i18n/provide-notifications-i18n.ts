import { provideTranslocoScope } from '@jsverse/transloco';

export const provideNotificationsI18n = () =>
  provideTranslocoScope({
    scope: 'notifications',
    loader: {
      en: () => import('./en.json'),
      ru: () => import('./ru.json'),
      uz: () => import('./uz.json'),
    },
  });
