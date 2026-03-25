import { Routes } from '@angular/router';

export const TEAM_MEMBERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./team-members').then((m) => m.TeamMembers),
  },
];
