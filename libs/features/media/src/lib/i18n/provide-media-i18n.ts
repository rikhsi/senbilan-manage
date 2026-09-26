import { type TranslocoService, type InlineLoader } from '@jsverse/transloco';
import { loadInlineTranslocoScope, provideInlineTranslocoScope } from '@senbilan/shared/i18n';

const MEDIA_I18N: InlineLoader = {
  en: () => import('./en.json'),
  ru: () => import('./ru.json'),
  uz: () => import('./uz.json'),
};

export const provideMediaI18n = () => provideInlineTranslocoScope('media', MEDIA_I18N);

export const loadMediaI18n = (i18n: TranslocoService): Promise<void> =>
  loadInlineTranslocoScope(i18n, 'media', MEDIA_I18N);
