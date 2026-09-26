import { provideInlineTranslocoScope } from '@senbilan/shared/i18n';

export const provideSettingsI18n = () =>
  provideInlineTranslocoScope('settings', {
    en: () => import('./en.json'),
    ru: () => import('./ru.json'),
    uz: () => import('./uz.json'),
  });
