import { provideInlineTranslocoScope } from '@senbilan/shared/i18n';

export const provideNotificationsI18n = () =>
  provideInlineTranslocoScope('notifications', {
    en: () => import('./en.json'),
    ru: () => import('./ru.json'),
    uz: () => import('./uz.json'),
  });
