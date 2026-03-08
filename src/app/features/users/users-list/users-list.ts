import { Component, inject, OnInit, signal } from '@angular/core';
import { UsersStore } from '../../../store/users/users.store';
import { CommonModule } from '@angular/common';
import { BasicTable } from '../../../shared/components/index';
import { StoreType } from '../../../core/types/stores-types';

@Component({
  selector: 'app-users-list',
  imports: [CommonModule, BasicTable],
  templateUrl: './users-list.html',
  styleUrl: './users-list.css',
})
export class UsersList {
  usersStore = inject(UsersStore);
  storeType = signal<StoreType>(StoreType.UsersStore);
}
