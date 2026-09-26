import { type TranslocoService, type InlineLoader } from '@jsverse/transloco';
import { loadInlineTranslocoScope, provideInlineTranslocoScope } from '@senbilan/shared/i18n';

const CONTENT_I18N: InlineLoader = {
  en: () => import('./en.json'),
  ru: () => import('./ru.json'),
  uz: () => import('./uz.json'),
};

export const provideContentI18n = () => provideInlineTranslocoScope('content', CONTENT_I18N);

export const loadContentI18n = (i18n: TranslocoService): Promise<void> =>
  loadInlineTranslocoScope(i18n, 'content', CONTENT_I18N);
