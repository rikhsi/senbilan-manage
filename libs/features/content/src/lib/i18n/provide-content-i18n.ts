import { provideInlineTranslocoScope } from '@senbilan/shared/i18n';

export const provideContentI18n = () =>
  provideInlineTranslocoScope('content', {
    en: () => import('./en.json'),
    ru: () => import('./ru.json'),
    uz: () => import('./uz.json'),
  });
