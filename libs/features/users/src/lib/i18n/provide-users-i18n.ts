import { type TranslocoService, type InlineLoader } from '@jsverse/transloco';
import { loadInlineTranslocoScope, provideInlineTranslocoScope } from '@senbilan/shared/i18n';

const USERS_I18N: InlineLoader = {
  en: () => import('./en.json'),
  ru: () => import('./ru.json'),
  uz: () => import('./uz.json'),
};

export const provideUsersI18n = () => provideInlineTranslocoScope('users', USERS_I18N);

export const loadUsersI18n = (i18n: TranslocoService): Promise<void> =>
  loadInlineTranslocoScope(i18n, 'users', USERS_I18N);
