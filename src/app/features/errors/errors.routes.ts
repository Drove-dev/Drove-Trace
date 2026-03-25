import { Routes } from '@angular/router';

export const ERRORS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./error-groups/error-groups').then((m) => m.ErrorGroups),
  },
];
