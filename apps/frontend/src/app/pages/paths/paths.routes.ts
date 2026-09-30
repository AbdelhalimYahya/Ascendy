import { Routes } from '@angular/router';

export const pathsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./paths-list/paths-list').then((m) => m.PathsList),
  },
];
