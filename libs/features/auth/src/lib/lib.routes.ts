import { type Routes } from '@angular/router';
import { provideNgxMask } from 'ngx-mask';
import { provideAuthI18n } from './i18n/provide-auth-i18n';

export const FEATURE_AUTH_ROUTES: Routes = [
  {
    path: '',
    title: 'auth.title',
    providers: [provideAuthI18n(), provideNgxMask()],
    loadComponent: () =>
      import('./login-page/login-page.component').then((m) => m.LoginPageComponent),
  },
];
