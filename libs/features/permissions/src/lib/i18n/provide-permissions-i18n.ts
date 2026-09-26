import { provideInlineTranslocoScope } from '@senbilan/shared/i18n';

export const providePermissionsI18n = () =>
  provideInlineTranslocoScope('permissions', {
    en: () => import('./en.json'),
    ru: () => import('./ru.json'),
    uz: () => import('./uz.json'),
  });
