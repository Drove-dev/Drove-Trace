import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export interface ListColumn<T> {
  key: keyof T;
  label: string;
  width: string; // e.g. '1fr', '130px', '120px'
  type: 'text' | 'badge' | 'env' | 'date' | 'mono';
}

@Component({
  selector: 'app-data-list-view',
  standalone: true,
  imports: [LucideAngularModule, DatePipe],
  templateUrl: './data-list-view.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataListView<T extends { id: string }> {
  // ── Data ──
  readonly items = input.required<T[]>();
  readonly columns = input.required<ListColumn<T>[]>();

  // ── Pagination ──
  readonly currentPage = input<number>(1);
  readonly totalPages = input<number>(0);
  readonly totalItems = input<number>(0);
  readonly hasPrevPage = input<boolean>(false);
  readonly hasNextPage = input<boolean>(false);

  // ── UI state ──
  readonly isLoading = input<boolean>(false);
  readonly skeletonRows = input<number>(5);
  readonly deletingId = input<string | null>(null);
  readonly emptyIcon = input<string>('folder-open');
  readonly emptyMessage = input<string>('No items found');
  readonly itemLabel = input<string>('items');

  readonly skeletonArray = computed(() => Array.from({ length: this.skeletonRows() }));

  // ── Events ──
  readonly pageChange = output<number>();
  readonly onEdit = output<T>();
  readonly onDelete = output<string>();

  /** Builds the CSS grid-template-columns value from column definitions + fixed actions column */
  readonly gridColsStyle = computed(() => {
    const cols = this.columns().map((c) => c.width).join(' ');
    return `${cols} 80px`;
  });

  /** Reads a cell value from an item by column key, cast to string for display */
  getCellValue(item: T, key: keyof T): string {
    const value = item[key];
    return value != null ? String(value) : '';
  }

  /** Returns Tailwind classes for environment badge pills */
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

  /** Formats an ISO date string to en-GB locale */
  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-GB');
  }
}
