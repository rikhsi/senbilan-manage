import { type Routes } from '@angular/router';
import { authGuard } from '@senbilan/shared/auth';
import { provideAuthI18n } from '@senbilan/features/auth';

export const appRoutes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        providers: [provideAuthI18n()],
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
