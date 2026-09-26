import { provideTranslocoScope } from '@jsverse/transloco';

/** Registers the `auth` scope; translations load from `assets/i18n/auth.{lang}.json`. */
export const provideAuthI18n = () => provideTranslocoScope('auth');
