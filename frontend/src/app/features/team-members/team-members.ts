import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { TeamMembersStore } from '../../store/team-members/team-members.store';
import { TeamMember } from '../../core/models/team-member.model';
import { TeamMembersFormModal } from '../../shared/components/modals/team-members-form-modal/team-members-form-modal';
import { DeleteConfirmModal } from '../../shared/components/modals/delete-confirm-modal/delete-confirm-modal';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { DataGridView } from '../../shared/components/data-grid-view/data-grid-view';
import { DataListView } from '../../shared/components/data-list-view/data-list-view';

@Component({
  selector: 'app-team-members',
  imports: [
    LucideAngularModule,
    ReactiveFormsModule,
    TeamMembersFormModal,
    DeleteConfirmModal,
    PageHeader,
    DataGridView,
    DataListView,
  ],
  templateUrl: './team-members.html',
})
export class TeamMembers {
  readonly teamMembersStore = inject(TeamMembersStore);

  readonly viewMode = signal<'grid' | 'list'>('grid');
  readonly showFormModal = signal<boolean>(false);
  readonly editingMember = signal<TeamMember | null>(null);
  readonly deletingId = signal<string | null>(null);
  readonly showConfirmModal = signal<boolean>(false);
  readonly pendingDeleteId = signal<string | null>(null);

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.teamMembersStore.search(input.value);
  }

  openCreate(): void {
    this.editingMember.set(null);
    this.showFormModal.set(true);
  }

  openEdit(member: TeamMember, event: Event): void {
    event.stopPropagation();
    this.editingMember.set(member);
    this.showFormModal.set(true);
  }

  closeModal(): void {
    this.showFormModal.set(false);
    this.editingMember.set(null);
  }

  requestDelete(id: string): void {
    this.pendingDeleteId.set(id);
    this.showConfirmModal.set(true);
  }

  onConfirmDelete(): void {
    const id = this.pendingDeleteId();
    if (!id) return;
    this.deletingId.set(id);
    this.teamMembersStore.deleteMember(id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.pendingDeleteId.set(null);
        this.showConfirmModal.set(false);
      },
      error: () => {
        this.deletingId.set(null);
        this.pendingDeleteId.set(null);
        this.showConfirmModal.set(false);
      },
    });
  }

  onCancelDelete(): void {
    this.pendingDeleteId.set(null);
    this.showConfirmModal.set(false);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US');
  }
}
