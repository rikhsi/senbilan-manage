import { type Routes } from '@angular/router';
import { provideProfileI18n } from './i18n/provide-profile-i18n';

export const FEATURE_PROFILE_ROUTES: Routes = [
  {
    path: '',
    providers: [provideProfileI18n()],
    loadComponent: () =>
      import('./profile-page/profile-page.component').then((m) => m.ProfilePageComponent),
  },
];
