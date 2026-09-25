import { type Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home-page.component').then((m) => m.HomePageComponent),
  },
  { path: '**', redirectTo: '' },
];
