import { type Routes } from '@angular/router';
import { provideSettingsI18n } from './i18n/provide-settings-i18n';

export const FEATURE_SETTINGS_ROUTES: Routes = [
  {
    path: '',
    providers: [provideSettingsI18n()],
    loadComponent: () =>
      import('./settings-page/settings-page.component').then((m) => m.SettingsPageComponent),
  },
];
