import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const problemsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./problems-list/problems-list').then((m) => m.ProblemsList),
  },
  {
    path: 'new',
    canActivate: [authGuard],
    loadComponent: () => import('./problem-new/problem-new').then((m) => m.ProblemNew),
  },
  {
    path: ':slug',
    loadComponent: () =>
      import('./problem-detail/problem-detail').then((m) => m.ProblemDetailComponent),
  },
];
