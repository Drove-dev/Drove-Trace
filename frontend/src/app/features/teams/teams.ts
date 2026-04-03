import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { TeamsStore } from '../../store/teams/teams.store';
import { Team } from '../../core/models/team.model';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { DataGridView } from '../../shared/components/data-grid-view/data-grid-view';
import { DataListView } from '../../shared/components/data-list-view/data-list-view';
import { TeamFormModal } from '../../shared/components/modals/team-form-modal/team-form-modal';
import { DeleteConfirmModal } from '../../shared/components/modals/delete-confirm-modal/delete-confirm-modal';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    PageHeader,
    DataGridView,
    DataListView,
    TeamFormModal,
    DeleteConfirmModal,
  ],
  templateUrl: './teams.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Teams {
  readonly teamsStore = inject(TeamsStore);

  readonly viewMode = signal<'grid' | 'list'>('grid');
  readonly showFormModal = signal<boolean>(false);
  readonly editingTeam = signal<Team | null>(null);
  readonly deletingId = signal<string | null>(null);
  readonly showConfirmModal = signal<boolean>(false);
  readonly pendingDeleteId = signal<string | null>(null);

  onSearch(query: string): void {
    this.teamsStore.search(query);
  }

  openCreate(): void {
    this.editingTeam.set(null);
    this.showFormModal.set(true);
  }

  openEdit(team: Team, event?: Event): void {
    event?.stopPropagation();
    this.editingTeam.set(team);
    this.showFormModal.set(true);
  }

  closeModal(): void {
    this.showFormModal.set(false);
    this.editingTeam.set(null);
  }

  requestDelete(id: string, event?: Event): void {
    event?.stopPropagation();
    this.pendingDeleteId.set(id);
    this.showConfirmModal.set(true);
  }

  onConfirmDelete(): void {
    const id = this.pendingDeleteId();
    if (!id) return;

    this.deletingId.set(id);
    this.teamsStore.deleteTeam(id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.pendingDeleteId.set(null);
        this.showConfirmModal.set(false);
      },
      error: () => {
        this.deletingId.set(null);
        this.showConfirmModal.set(false);
      },
    });
  }

  onCancelDelete(): void {
    this.pendingDeleteId.set(null);
    this.showConfirmModal.set(false);
  }
}
