import { type Routes } from '@angular/router';
import { provideProfileI18n } from './i18n/provide-profile-i18n';

export const FEATURE_PROFILE_ROUTES: Routes = [
  {
    path: '',
    providers: [provideProfileI18n()],
    loadComponent: () =>
      import('./profile-shell/profile-shell.component').then((m) => m.ProfileShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'settings' },
      { path: 'info', pathMatch: 'full', redirectTo: 'settings' },
      {
        path: 'settings',
        title: 'profile.pageSettings',
        loadComponent: () =>
          import('./profile-settings/profile-settings-page.component').then(
            (m) => m.ProfileSettingsPageComponent,
          ),
      },
    ],
  },
];
