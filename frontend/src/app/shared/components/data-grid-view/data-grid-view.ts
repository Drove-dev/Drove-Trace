import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

export interface GridCardConfig<T> {
  titleKey: keyof T;
  subtitleKey: keyof T;
  environmentKey?: keyof T | null;
  dateKey: keyof T;
  icon: string; // lucide icon name
}

@Component({
  selector: 'app-data-grid-view',
  imports: [LucideAngularModule],
  templateUrl: './data-grid-view.html',
})
export class DataGridView<T extends { id: string }> {
  // ── Data ──
  readonly items = input.required<T[]>();
  readonly cardConfig = input.required<GridCardConfig<T>>();

  // ── Pagination ──
  readonly currentPage = input<number>(1);
  readonly totalPages = input<number>(0);
  readonly totalItems = input<number>(0);
  readonly hasPrevPage = input<boolean>(false);
  readonly hasNextPage = input<boolean>(false);

  // ── UI state ──
  readonly isLoading = input<boolean>(false);
  readonly skeletonCount = input<number>(6);
  readonly deletingId = input<string | null>(null);
  readonly emptyMessage = input<string>('No items found');
  readonly itemLabel = input<string>('items');

  readonly skeletonArray = computed(() => Array.from({ length: this.skeletonCount() }));

  // ── Events ──
  readonly pageChange = output<number>();
  readonly onEdit = output<T>();
  readonly onDelete = output<string>();

  // ── Internal helpers ──

  getValue(item: T, key: keyof T | null | undefined): string {
    if (!key) return '';
    const v = item[key];
    return v != null ? String(v) : '';
  }

  getEnvClass(env: string): string {
    switch (env) {
      case 'production':
        return 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400';
      case 'staging':
        return 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500';
      default:
        return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    }
  }

  getIconColor(env: string): string {
    switch (env) {
      case 'production':
        return '#534AB7';
      case 'staging':
        return '#854F0B';
      default:
        return '#64748b'; // slate-500
    }
  }

  getIconBg(env: string): string {
    switch (env) {
      case 'production':
        return 'bg-indigo-50 dark:bg-indigo-500/10';
      case 'staging':
        return 'bg-amber-50 dark:bg-amber-500/10';
      default:
        return 'bg-slate-100 dark:bg-slate-800';
    }
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-GB');
  }
}
