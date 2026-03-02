import { Component, inject } from '@angular/core';
import { DashboardStore } from '../../../store/dashboard/dashboard.store';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
dashboardStore = inject(DashboardStore);
}
