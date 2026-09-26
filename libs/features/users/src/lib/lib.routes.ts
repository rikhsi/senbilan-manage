import { type Routes } from '@angular/router';
import { provideUsersI18n } from './i18n/provide-users-i18n';

export const FEATURE_USERS_ROUTES: Routes = [
  {
    path: '',
    providers: [provideUsersI18n()],
    children: [
      {
        path: '',
        title: 'users.title',
        loadComponent: () =>
          import('./users-page/users-page.component').then((m) => m.UsersPageComponent),
      },
      {
        // eslint-disable-next-line @senbilan/no-hardcoded-text-ts -- Angular route param segment
        path: ':id',
        title: 'users.detailTitle',
        loadComponent: () =>
          import('./user-detail-page/user-detail-page.component').then(
            (m) => m.UserDetailPageComponent,
          ),
      },
    ],
  },
];
