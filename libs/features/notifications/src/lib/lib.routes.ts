import { type Routes } from '@angular/router';
import { provideNotificationsI18n } from './i18n/provide-notifications-i18n';

export const FEATURE_NOTIFICATIONS_ROUTES: Routes = [
  {
    path: '',
    providers: [provideNotificationsI18n()],
    loadComponent: () =>
      import('./notifications-page/notifications-page.component').then(
        (m) => m.NotificationsPageComponent,
      ),
  },
];
