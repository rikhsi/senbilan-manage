import { type Routes } from '@angular/router';
import { authGuard, guestGuard, permissionGuard } from '@senbilan/shared/auth';

export const appRoutes: Routes = [
  {
    path: 'auth',
    canMatch: [guestGuard(['dashboard'])],
    children: [
      {
        path: 'login',
        loadChildren: () => import('@senbilan/features/auth').then((m) => m.FEATURE_AUTH_ROUTES),
      },
      { path: '', pathMatch: 'full', redirectTo: 'login' },
    ],
  },
  {
    path: '',
    canMatch: [authGuard],
    loadComponent: () => import('./shell-layout.component').then((m) => m.ShellLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        canMatch: [permissionGuard('dashboard:read')],
        loadChildren: () =>
          import('@senbilan/features/dashboard').then((m) => m.FEATURE_DASHBOARD_ROUTES),
      },
      {
        path: 'users',
        canMatch: [permissionGuard('users:read')],
        loadChildren: () => import('@senbilan/features/users').then((m) => m.FEATURE_USERS_ROUTES),
      },
      {
        path: 'couples',
        canMatch: [permissionGuard('couples:read')],
        loadChildren: () =>
          import('@senbilan/features/couples').then((m) => m.FEATURE_COUPLES_ROUTES),
      },
      {
        path: 'content',
        canMatch: [permissionGuard('content:read')],
        loadChildren: () =>
          import('@senbilan/features/content').then((m) => m.FEATURE_CONTENT_ROUTES),
      },
      {
        path: 'broadcasts',
        canMatch: [permissionGuard('broadcasts:read')],
        loadChildren: () =>
          import('@senbilan/features/broadcasts').then((m) => m.FEATURE_BROADCASTS_ROUTES),
      },
      {
        path: 'media',
        canMatch: [permissionGuard('content:read')],
        loadChildren: () => import('@senbilan/features/media').then((m) => m.FEATURE_MEDIA_ROUTES),
      },
      {
        path: 'system',
        canMatch: [permissionGuard('dashboard:read')],
        loadChildren: () =>
          import('@senbilan/features/system').then((m) => m.FEATURE_SYSTEM_ROUTES),
      },
      {
        path: 'profile',
        canMatch: [permissionGuard('profile:write')],
        loadChildren: () =>
          import('@senbilan/features/profile').then((m) => m.FEATURE_PROFILE_ROUTES),
      },
    ],
  },
  { path: 'login', redirectTo: 'auth/login' },
  { path: '**', redirectTo: 'dashboard' },
];
