import { provideInlineTranslocoScope } from '@senbilan/shared/i18n';

export const provideBroadcastsI18n = () =>
  provideInlineTranslocoScope('broadcasts', {
    en: () => import('./en.json'),
    ru: () => import('./ru.json'),
    uz: () => import('./uz.json'),
  });
