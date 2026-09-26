import { type Routes } from '@angular/router';
import { provideCouplesI18n } from './i18n/provide-couples-i18n';

export const FEATURE_COUPLES_ROUTES: Routes = [
  {
    path: '',
    providers: [provideCouplesI18n()],
    children: [
      {
        path: '',
        title: 'couples.title',
        loadComponent: () =>
          import('./couples-page/couples-page.component').then((m) => m.CouplesPageComponent),
      },
      {
        // eslint-disable-next-line @senbilan/no-hardcoded-text-ts -- Angular route param segment
        path: ':id',
        title: 'couples.detailTitle',
        loadComponent: () =>
          import('./couple-detail-page/couple-detail-page.component').then(
            (m) => m.CoupleDetailPageComponent,
          ),
      },
    ],
  },
];
