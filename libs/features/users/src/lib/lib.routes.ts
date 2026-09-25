import { type Routes } from '@angular/router';
import { provideUsersI18n } from './i18n/provide-users-i18n';

export const FEATURE_USERS_ROUTES: Routes = [
  {
    path: '',
    providers: [provideUsersI18n()],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./users-page/users-page.component').then((m) => m.UsersPageComponent),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./user-detail-page/user-detail-page.component').then(
            (m) => m.UserDetailPageComponent,
          ),
      },
    ],
  },
];
