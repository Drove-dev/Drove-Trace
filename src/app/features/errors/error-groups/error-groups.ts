import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ErrorStatus } from '../../../core/models/error-group.model';
import { ErrorsStore } from '../../../store/stores-index';

@Component({
  selector: 'app-error-groups',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './error-groups.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorGroups {
  // Inject the store
  public readonly errorsStore = inject(ErrorsStore);
  // State Signals
  readonly currentFilter = signal<'all' | ErrorStatus>('all');
  readonly searchQuery = signal<string>('');

  // Computed signal for the filtered list based on the store
  readonly filteredErrors = computed(() => {
    const list = this.errorsStore.errorGroups();
    const filter = this.currentFilter();
    const query = this.searchQuery().toLowerCase();

    return list.filter((e) => {
      const matchesFilter = filter === 'all' || e.status === filter;
      const matchesSearch =
        query === '' ||
        e.title.toLowerCase().includes(query) ||
        e.file.toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  });

  setFilter(filter: 'all' | ErrorStatus) {
    this.currentFilter.set(filter);
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  // View Helpers
  // getAssigneeColor(assignee: string | null): string {
  //   switch (assignee) {
  //     case 'AM':
  //       return 'bg-indigo-500';
  //     case 'CM':
  //       return 'bg-cyan-600';
  //     case 'JL':
  //       return 'bg-emerald-600';
  //     case 'SR':
  //       return 'bg-amber-600';
  //     default:
  //       return 'bg-slate-300 dark:bg-slate-700';
  //   }
  // }

  getBadgeStyles(status: ErrorStatus) {
    switch (status) {
      case 'open':
      case 'critical':
        return {
          container: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
          dot: 'bg-red-500',
        };
      case 'investigating':
      case 'warning':
        return {
          container: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500',
          dot: 'bg-amber-500',
        };
      case 'resolved':
      case 'healthy':
        return {
          container: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
          dot: 'bg-emerald-500',
        };
      default:
        return { container: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' };
    }
  }

  formatLabel(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }
}
