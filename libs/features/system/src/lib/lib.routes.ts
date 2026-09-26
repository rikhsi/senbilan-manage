import { type Routes } from '@angular/router';
import { provideSystemI18n } from './i18n/provide-system-i18n';

export const FEATURE_SYSTEM_ROUTES: Routes = [
  {
    path: '',
    title: 'system.title',
    providers: [provideSystemI18n()],
    loadComponent: () =>
      import('./system-page/system-page.component').then((m) => m.SystemPageComponent),
  },
];
