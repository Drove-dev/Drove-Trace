import { Routes } from '@angular/router';

export const SDK_KEYS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./sdk-keys').then((m) => m.SdkKeys),
  },
];
