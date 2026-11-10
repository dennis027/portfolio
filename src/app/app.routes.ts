import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./portfolio/portfolio').then((m) => m.Portfolio),
  },
  {
    path: '**',
    title: 'Page not found — Dennis Kimani',
    loadComponent: () => import('./not-found/not-found').then((m) => m.NotFound),
  },
];
