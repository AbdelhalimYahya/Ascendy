import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./pages/landing/landing').then((m) => m.Landing) },
  {
    path: 'problems',
    loadChildren: () => import('./pages/problems/problems.routes').then((m) => m.problemsRoutes),
  },
  {
    path: 'paths',
    loadChildren: () => import('./pages/paths/paths.routes').then((m) => m.pathsRoutes),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'ai',
    loadComponent: () => import('./pages/ai/ai').then((m) => m.Ai),
  },
  {
    path: 'profile/:username',
    loadComponent: () =>
      import('./pages/profile/profile').then((m) => m.Profile),
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/settings/settings').then((m) => m.Settings),
  },
  { path: '**', redirectTo: '' },
];
