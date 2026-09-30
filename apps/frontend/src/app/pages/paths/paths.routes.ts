import { Routes } from '@angular/router';

export const pathsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./paths-list/paths-list').then((m) => m.PathsList),
  },
  {
    path: 'create',
    loadComponent: () => import('./path-create/path-create').then((m) => m.PathCreate),
  },
  {
    path: ':id',
    loadComponent: () => import('./path-detail/path-detail').then((m) => m.PathDetail),
  },
];
