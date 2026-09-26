import { type Routes } from '@angular/router';
import { provideBroadcastsI18n } from './i18n/provide-broadcasts-i18n';

export const FEATURE_BROADCASTS_ROUTES: Routes = [
  {
    path: '',
    providers: [provideBroadcastsI18n()],
    children: [
      {
        path: '',
        title: 'broadcasts.title',
        loadComponent: () =>
          import('./broadcasts-page/broadcasts-page.component').then(
            (m) => m.BroadcastsPageComponent,
          ),
      },
      {
        // eslint-disable-next-line @senbilan/no-hardcoded-text-ts -- Angular route param segment
        path: ':id',
        title: 'broadcasts.detailTitle',
        loadComponent: () =>
          import('./broadcasts-detail-page/broadcasts-detail-page.component').then(
            (m) => m.BroadcastsDetailPageComponent,
          ),
      },
    ],
  },
];
