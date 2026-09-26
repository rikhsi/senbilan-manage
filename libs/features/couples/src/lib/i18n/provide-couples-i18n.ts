import { type TranslocoService, type InlineLoader } from '@jsverse/transloco';
import { loadInlineTranslocoScope, provideInlineTranslocoScope } from '@senbilan/shared/i18n';

const COUPLES_I18N: InlineLoader = {
  en: () => import('./en.json'),
  ru: () => import('./ru.json'),
  uz: () => import('./uz.json'),
};

export const provideCouplesI18n = () => provideInlineTranslocoScope('couples', COUPLES_I18N);

export const loadCouplesI18n = (i18n: TranslocoService): Promise<void> =>
  loadInlineTranslocoScope(i18n, 'couples', COUPLES_I18N);
