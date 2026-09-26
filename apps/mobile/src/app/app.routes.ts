import { type Routes } from '@angular/router';
import { authGuard, guestGuard } from '@senbilan/shared/auth';
import { provideNgxMask } from 'ngx-mask';
import { provideAuthI18n } from '@senbilan/features/auth';

export const appRoutes: Routes = [
  {
    path: 'auth',
    canMatch: [guestGuard(['/'])],
    children: [
      {
        path: 'login',
        providers: [provideAuthI18n(), provideNgxMask()],
        loadComponent: () =>
          import('./auth/login-page.component').then((m) => m.LoginPageComponent),
      },
      { path: '', pathMatch: 'full', redirectTo: 'login' },
    ],
  },
  {
    path: '',
    canMatch: [authGuard],
    loadComponent: () => import('./home-page.component').then((m) => m.HomePageComponent),
  },
  { path: 'login', redirectTo: 'auth/login' },
  { path: '**', redirectTo: '' },
];
