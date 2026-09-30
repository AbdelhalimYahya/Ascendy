import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const pathsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./paths-list/paths-list').then((m) => m.PathsList),
  },
  {
    path: 'create',
    canActivate: [authGuard],
    loadComponent: () => import('./path-create/path-create').then((m) => m.PathCreate),
  },
  {
    path: ':id',
    loadComponent: () => import('./path-detail/path-detail').then((m) => m.PathDetail),
  },
];
