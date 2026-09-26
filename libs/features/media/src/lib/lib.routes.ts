import { type Routes } from '@angular/router';
import { provideMediaI18n } from './i18n/provide-media-i18n';

export const FEATURE_MEDIA_ROUTES: Routes = [
  {
    path: '',
    providers: [provideMediaI18n()],
    children: [
      {
        path: '',
        title: 'media.title',
        loadComponent: () =>
          import('./media-page/media-page.component').then((m) => m.MediaPageComponent),
      },
      {
        // eslint-disable-next-line @senbilan/no-hardcoded-text-ts -- Angular route param segment
        path: ':id',
        title: 'media.detailTitle',
        loadComponent: () =>
          import('./media-detail-page/media-detail-page.component').then(
            (m) => m.MediaDetailPageComponent,
          ),
      },
    ],
  },
];
