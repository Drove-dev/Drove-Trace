import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { ErrorGroup } from '../../../core/models/error-group.model';
import { ErrorsStore } from '../../../store/stores-index';
import { ErrorDetailModal } from '../../../shared/components/modals/error-detail-modal/error-detail-modal';

@Component({
  selector: 'app-error-groups',
  standalone: true,
  imports: [LucideAngularModule, ErrorDetailModal],
  templateUrl: './error-groups.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorGroups {
  public readonly errorsStore = inject(ErrorsStore);

  // ── Search ────────────────────────────────────────────────────────────────
  readonly searchQuery = signal<string>('');

  readonly filteredErrors = computed(() => {
    const list = this.errorsStore.errorGroups();
    const query = this.searchQuery().toLowerCase();
    if (!query) return list;
    return list.filter(
      (e) =>
        e.fingerprint.toLowerCase().includes(query) ||
        e.projectName.toLowerCase().includes(query),
    );
  });

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  // ── View helpers ──────────────────────────────────────────────────────────
  formatRelativeDate(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  truncateFingerprint(fp: string): string {
    return fp.length > 20 ? fp.slice(0, 20) + '...' : fp;
  }

  // ── Modal ─────────────────────────────────────────────────────────────────
  readonly selectedGroup = signal<ErrorGroup | null>(null);

  openDetail(group: ErrorGroup): void {
    this.selectedGroup.set(group);
  }

  closeDetail(): void {
    this.selectedGroup.set(null);
  }
}
