import { Component, inject } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { DashboardStore } from '../../../store/dashboard/dashboard.store';
import { LucideAngularModule } from 'lucide-angular';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [LucideAngularModule, RouterLink, SlicePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  dashboardStore = inject(DashboardStore);
}
