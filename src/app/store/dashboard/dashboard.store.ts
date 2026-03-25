import { computed, inject, Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Dashboard } from '../../core/services/dashboard';
import {
  DashboardErrorByEnvironment,
  DashboardErrorByProject,
} from '../../core/models/Dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardStore {
  private dashboardService = inject(Dashboard);

  private summaryResource = rxResource({
    stream: () => this.dashboardService.getStats(),
  });

  readonly summary = this.summaryResource.value;
  readonly loading = this.summaryResource.isLoading;

  // ── Error — normalised to string | null (strict-mode safe) ───────────────
  readonly error = computed<string | null>(() => {
    const err = this.summaryResource.error();
    if (!err) return null;
    if (err instanceof Error) return err.message;
    if (typeof err === 'string') return err;
    return 'An unexpected error occurred';
  });

  // ── Time-range error counts ───────────────────────────────────────────────
  readonly errorsLast24h = computed(() => this.summary()?.errorsLast24h ?? 0);
  readonly errorsLast7days = computed(() => this.summary()?.errorsLast7days ?? 0);
  readonly errorsLast30days = computed(() => this.summary()?.errorsLast30days ?? 0);

  // ── Errors by environment with proportional percentage ───────────────────
  readonly errorsByEnvironmentWithPct = computed<(DashboardErrorByEnvironment & { pct: number })[]>(
    () => {
      const items = this.summary()?.errorsByEnvironment ?? [];
      const max = items.reduce((acc, item) => Math.max(acc, item.count), 0);
      return items.map((item) => ({
        ...item,
        pct: max > 0 ? Math.round((item.count / max) * 100) : 0,
      }));
    },
  );

  // ── Top 5 errors ──────────────────────────────────────────────────────────
  readonly topErrors = computed(() => (this.summary()?.topErrors ?? []).slice(0, 5));

  // ── Errors by project (top 5, sorted desc) ───────────────────────────────
  readonly errorsByProject = computed<DashboardErrorByProject[]>(() =>
    (this.summary()?.errorsByProject ?? []).sort((a, b) => b.count - a.count).slice(0, 5),
  );

  // ── SDK keys ──────────────────────────────────────────────────────────────
  readonly activeSdkKeys = computed(() => this.summary()?.activeSdkKeys ?? 0);
  readonly inactiveSdkKeys = computed(() => this.summary()?.inactiveSdkKeys ?? 0);

  reload(): void {
    this.summaryResource.reload();
  }
}
