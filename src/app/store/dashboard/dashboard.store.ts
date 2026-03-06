
import { inject, resource } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Dashboard } from '../../core/services/dashboard';

export class DashboardStore {
  private dashboardService = inject(Dashboard);

  private summaryResource = resource({
    loader: () => firstValueFrom(this.dashboardService.getStats())
  });

  readonly summary = this.summaryResource.value;
  readonly loading = this.summaryResource.isLoading;
  readonly error = this.summaryResource.error;

  reload() {
    this.summaryResource.reload();
  }
}
