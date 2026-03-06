import { Component, inject } from '@angular/core';
import { DashboardStore } from '../../../store/dashboard/dashboard.store';
import { JsonPipe } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [JsonPipe, LucideAngularModule, RouterLink ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
dashboardStore = inject(DashboardStore);
}
