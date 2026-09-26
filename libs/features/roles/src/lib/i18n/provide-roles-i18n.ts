import { provideInlineTranslocoScope } from '@senbilan/shared/i18n';

export const provideRolesI18n = () =>
  provideInlineTranslocoScope('roles', {
    en: () => import('./en.json'),
    ru: () => import('./ru.json'),
    uz: () => import('./uz.json'),
  });
