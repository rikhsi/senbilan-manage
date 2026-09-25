import { type Routes } from '@angular/router';
import { provideDashboardI18n } from './i18n/provide-dashboard-i18n';

export const FEATURE_DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    providers: [provideDashboardI18n()],
    loadComponent: () =>
      import('./dashboard-page/dashboard-page.component').then((m) => m.DashboardPageComponent),
  },
];
