import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { UsersStore } from '../../../store/users/users.store';
import { User } from '../../../core/models/user.model';
import { UsersFormModal } from '../../../shared/components/modals/users-form-modal/users-form-modal';
import { DeleteConfirmModal } from '../../../shared/components/modals/delete-confirm-modal/delete-confirm-modal';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { DataGridView } from '../../../shared/components/data-grid-view/data-grid-view';
import { DataListView } from '../../../shared/components/data-list-view/data-list-view';

@Component({
  selector: 'app-users-list',
  imports: [
    LucideAngularModule,
    ReactiveFormsModule,
    UsersFormModal,
    DeleteConfirmModal,
    PageHeader,
    DataGridView,
    DataListView,
  ],
  templateUrl: './users-list.html',
})
export class UsersList {
  readonly usersStore = inject(UsersStore);

  readonly viewMode = signal<'grid' | 'list'>('grid');
  readonly showFormModal = signal<boolean>(false);
  readonly editingUser = signal<User | null>(null);
  readonly deletingId = signal<string | null>(null);
  readonly showConfirmModal = signal<boolean>(false);
  readonly pendingDeleteId = signal<string | null>(null);

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.usersStore.search(input.value);
  }

  openCreate(): void {
    this.editingUser.set(null);
    this.showFormModal.set(true);
  }

  openEdit(user: User, event: Event): void {
    event.stopPropagation();
    this.editingUser.set(user);
    this.showFormModal.set(true);
  }

  closeModal(): void {
    this.showFormModal.set(false);
    this.editingUser.set(null);
  }

  requestDelete(id: string): void {
    this.pendingDeleteId.set(id);
    this.showConfirmModal.set(true);
  }

  onConfirmDelete(): void {
    const id = this.pendingDeleteId();
    if (!id) return;
    this.deletingId.set(id);
    this.usersStore.deleteUser(id).subscribe({
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
