/** Native-language labels for the locale menu (not product copy). */
export const LOCALE_NATIVE_LABELS: Readonly<Record<string, string>> = {
  ru: 'Русский',
  en: 'English',
  uz: 'Oʻzbekcha',
};

export type LocaleFlagId = 'ru' | 'en' | 'uz';

export const isLocaleFlagId = (value: string): value is LocaleFlagId =>
  value === 'ru' || value === 'en' || value === 'uz';
