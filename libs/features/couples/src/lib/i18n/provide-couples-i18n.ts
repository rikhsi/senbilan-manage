import { provideInlineTranslocoScope } from '@senbilan/shared/i18n';

export const provideCouplesI18n = () =>
  provideInlineTranslocoScope('couples', {
    en: () => import('./en.json'),
    ru: () => import('./ru.json'),
    uz: () => import('./uz.json'),
  });
