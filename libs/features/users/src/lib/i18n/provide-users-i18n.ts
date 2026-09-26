import { provideInlineTranslocoScope } from '@senbilan/shared/i18n';

export const provideUsersI18n = () =>
  provideInlineTranslocoScope('users', {
    en: () => import('./en.json'),
    ru: () => import('./ru.json'),
    uz: () => import('./uz.json'),
  });
