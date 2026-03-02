
import { inject, resource } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Dashboard } from '../../core/services/dashboard';


export interface DashboardSummary {
  totalUsers: number;
  totalReports: number;
  activeErrors: number;
  resolvedToday: number;
}

export class DashboardStore {
  private dashboardService = inject(Dashboard);

  // resource() maneja loading/error/value automáticamente — sin ngOnInit
  private summaryResource = resource({
    loader: () => firstValueFrom(this.dashboardService.getErrorGroups())
  });

  readonly summary = this.summaryResource.value;
  readonly loading = this.summaryResource.isLoading;
  readonly error = this.summaryResource.error;

  reload() {
    this.summaryResource.reload();
  }
}
