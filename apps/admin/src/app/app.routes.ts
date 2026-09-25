import { type Routes } from '@angular/router';
import { authGuard, permissionGuard } from '@senbilan/shared/auth';

export const appRoutes: Routes = [
  {
    path: 'auth',
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
        path: 'roles',
        canMatch: [permissionGuard('roles:read')],
        loadChildren: () => import('@senbilan/features/roles').then((m) => m.FEATURE_ROLES_ROUTES),
      },
      {
        path: 'permissions',
        canMatch: [permissionGuard('permissions:read')],
        loadChildren: () =>
          import('@senbilan/features/permissions').then((m) => m.FEATURE_PERMISSIONS_ROUTES),
      },
      {
        path: 'notifications',
        canMatch: [permissionGuard('notifications:read')],
        loadChildren: () =>
          import('@senbilan/features/notifications').then((m) => m.FEATURE_NOTIFICATIONS_ROUTES),
      },
      {
        path: 'settings',
        canMatch: [permissionGuard('settings:read')],
        loadChildren: () =>
          import('@senbilan/features/settings').then((m) => m.FEATURE_SETTINGS_ROUTES),
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
