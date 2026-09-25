import { type Routes } from '@angular/router';
import { provideRolesI18n } from './i18n/provide-roles-i18n';

export const FEATURE_ROLES_ROUTES: Routes = [
  {
    path: '',
    providers: [provideRolesI18n()],
    loadComponent: () =>
      import('./roles-page/roles-page.component').then((m) => m.RolesPageComponent),
  },
];
