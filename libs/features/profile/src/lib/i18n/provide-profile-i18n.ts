import { provideInlineTranslocoScope } from '@senbilan/shared/i18n';

export const provideProfileI18n = () =>
  provideInlineTranslocoScope('profile', {
    en: () => import('./en.json'),
    ru: () => import('./ru.json'),
    uz: () => import('./uz.json'),
  });
