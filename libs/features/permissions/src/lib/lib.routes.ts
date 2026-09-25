import { type Routes } from '@angular/router';
import { providePermissionsI18n } from './i18n/provide-permissions-i18n';

export const FEATURE_PERMISSIONS_ROUTES: Routes = [
  {
    path: '',
    providers: [providePermissionsI18n()],
    loadComponent: () =>
      import('./permissions-page/permissions-page.component').then(
        (m) => m.PermissionsPageComponent,
      ),
  },
];
