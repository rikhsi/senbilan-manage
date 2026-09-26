import { type AppLocale } from '@senbilan/shared/i18n';

export type SettingsTab = 'theme' | 'language' | 'density' | 'profile';

export type { AppLocale };

export interface SettingsProfileModel {
  firstName: string;
  lastName: string;
  email: string;
}
