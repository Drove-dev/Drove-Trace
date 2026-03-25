import { Component, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { LucideAngularModule } from 'lucide-angular';
import { PaginatorModule } from 'primeng/paginator';
import { StoreType } from '../../../../core/types/stores-types';
import { DialogModule } from 'primeng/dialog';
import { UsersFormModal } from '../../modals/users-form-modal/users-form-modal';
import { TeamMembersFormModal } from '../../modals/team-members-form-modal/team-members-form-modal';
import { SdkKeysFormModal } from '../../modals/sdk-keys-form-modal/sdk-keys-form-modal';
import { TeamsFormModal } from '../../modals/teams-form-modal/teams-form-modal';
import { User } from '../../../../core/models/user.model';
import { ConfirmModal } from '../../modals/confirm-modal/confirm-modal';
import { CustomFormData } from '../../../../core/models/custom-form-data.model';
import { TeamMembers } from '../../../../features/team-members/team-members';

@Component({
  selector: 'basic-table',
  imports: [
    CommonModule,
    TableModule,
    DatePipe,
    SkeletonModule,
    LucideAngularModule,
    PaginatorModule,
    UsersFormModal,
    TeamMembersFormModal,
    SdkKeysFormModal,
    DialogModule,
    ConfirmModal,
    TeamsFormModal,
  ],
  templateUrl: './basic-table.html',
  styleUrl: './basic-table.css',
})
export class BasicTable implements OnInit {
  dataSource = input.required<User | any>();
  storeType = input.required<StoreType>();
  columns = input.required<string[]>();
  tableStyles = {
    root: 'w-full',
    table: 'w-full border-collapse text-left text-sm',
    thead: '',
    tbody: '',
  };
  editData = signal<User | TeamMembers | null | any>(null);
  deleteData = signal<User | TeamMembers | null | any>(null);
  title = signal<string>('');
  revealedKeys = signal<Record<string, boolean>>({});

  toggleKey(id: string) {
    this.revealedKeys.update((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  isRevealed(id: string): boolean {
    return !!this.revealedKeys()[id];
  }

  ngOnInit(): void {
    this.title.set(this.storeType());
  }

  onPageChange(event: any) {
    const pageNumber = event.first / event.rows + 1;
    if (this.storeType() == 'users') {
      this.dataSource().goToPage(pageNumber);
    } else if (this.storeType() == 'sdk-keys') {
      this.dataSource().goToPage(pageNumber);
    } else if (this.storeType() == 'teams') {
      this.dataSource().goToPage(pageNumber);
    }
  }

  search(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    const ds = this.dataSource();
    if (ds.searchByName) {
      ds.searchByName(filterValue);
    } else if (ds.searchByTeam) {
      ds.searchByTeam(filterValue);
    }
  }

  openForm(data: CustomFormData) {
    data.formType = this.storeType();
    this.editData.set(data);
  }

  confirmDelete(data: CustomFormData) {
    data.formType = this.storeType();
    this.deleteData.set(data);
  }
}
