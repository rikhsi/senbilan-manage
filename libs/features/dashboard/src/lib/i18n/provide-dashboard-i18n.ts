import { provideInlineTranslocoScope } from '@senbilan/shared/i18n';

export const provideDashboardI18n = () =>
  provideInlineTranslocoScope('dashboard', {
    en: () => import('./en.json'),
    ru: () => import('./ru.json'),
    uz: () => import('./uz.json'),
  });
