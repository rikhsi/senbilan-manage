import { type Routes } from '@angular/router';
import { provideAuthI18n } from './i18n/provide-auth-i18n';

export const FEATURE_AUTH_ROUTES: Routes = [
  {
    path: '',
    providers: [provideAuthI18n()],
    loadComponent: () =>
      import('./login-page/login-page.component').then((m) => m.LoginPageComponent),
  },
];
