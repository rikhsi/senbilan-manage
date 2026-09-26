import { provideInlineTranslocoScope } from '@senbilan/shared/i18n';

export const provideMediaI18n = () =>
  provideInlineTranslocoScope('media', {
    en: () => import('./en.json'),
    ru: () => import('./ru.json'),
    uz: () => import('./uz.json'),
  });
