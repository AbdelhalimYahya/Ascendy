import { Routes } from '@angular/router';

export const problemsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./problems-list/problems-list').then((m) => m.ProblemsList),
  },
];
