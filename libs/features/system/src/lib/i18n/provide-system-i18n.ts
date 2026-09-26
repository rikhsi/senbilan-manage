import { provideInlineTranslocoScope } from '@senbilan/shared/i18n';

export const provideSystemI18n = () =>
  provideInlineTranslocoScope('system', {
    en: () => import('./en.json'),
    ru: () => import('./ru.json'),
    uz: () => import('./uz.json'),
  });
