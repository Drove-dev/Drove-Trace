import { Component, inject, signal } from '@angular/core';
import { UsersStore } from '../../../store/users/users.store';
import { CommonModule } from '@angular/common';
import { BasicTable, UsersFormModal } from '../../../shared/components/index';
import { StoreType } from '../../../core/types/stores-types';
import { LucideAngularModule } from 'lucide-angular';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-users-list',
  imports: [CommonModule, BasicTable, LucideAngularModule, UsersFormModal],
  templateUrl: './users-list.html',
  styleUrl: './users-list.css',
})
export class UsersList {
  usersStore = inject(UsersStore);
  storeType = signal<StoreType>(StoreType.UsersStore);
  data = signal<User | null>(null);

  openForm() {
    this.data.set({ name: '', email: '', id: '', createdAt: new Date() });
  }
}
