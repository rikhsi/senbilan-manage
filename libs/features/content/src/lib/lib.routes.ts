import { type Routes } from '@angular/router';
import { provideContentI18n } from './i18n/provide-content-i18n';

export const FEATURE_CONTENT_ROUTES: Routes = [
  {
    path: '',
    providers: [provideContentI18n()],
    children: [
      {
        path: '',
        title: 'content.title',
        loadComponent: () =>
          import('./content-page/content-page.component').then((m) => m.ContentPageComponent),
      },
      {
        // eslint-disable-next-line @senbilan/no-hardcoded-text-ts -- Angular route param segment
        path: ':id',
        title: 'content.detailTitle',
        loadComponent: () =>
          import('./content-detail-page/content-detail-page.component').then(
            (m) => m.ContentDetailPageComponent,
          ),
      },
    ],
  },
];
