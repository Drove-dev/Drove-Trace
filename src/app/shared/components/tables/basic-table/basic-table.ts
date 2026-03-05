import { Component, effect, inject, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { UsersStore } from '../../../../store/stores-index';
import { LucideAngularModule } from 'lucide-angular';
import { PaginatorModule } from 'primeng/paginator';
import { StoreType } from '../../../../core/types/stores-types';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { UsersFormModal } from '../../modals/users-form-modal/users-form-modal';

@Component({
  selector: 'basic-table',
  imports: [
    CommonModule,
    TableModule,
    DatePipe,
    SkeletonModule,
    LucideAngularModule,
    PaginatorModule,
    SkeletonModule,
    UsersFormModal,
    DialogModule,
  ],
  templateUrl: './basic-table.html',
  styleUrl: './basic-table.css',
})
export class BasicTable implements OnInit {
  usersStore = inject(UsersStore);
  router = inject(Router);
  // Inputs
  dataSource = input.required<UsersStore>();
  storeType = input.required<StoreType>();
  colunms = input.required<string[]>();

  // Table Styles
  tableStyles = {
    root: 'w-full overflow-x-auto',
    table: 'w-full border-collapse text-left text-sm',
    thead: 'table-header',
    tbody: 'divide-y divide-[var(--border)]',
  };
  // Form Modal
  editData = signal<UsersStore | null>(null);

  // Signals
  title = signal<string>('');
  data = signal<UsersStore | null>(null);
  page = signal(1);
  rows = signal(10);
  totalRecords = signal(0);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.filterByStoreType(this.storeType());
  }

  onPageChange(event: any) {
    this.page.update(() => event.first);
    this.rows.update(() => event.rows);
    this.totalRecords.update(() => event.totalRecords);
  }

  filterByStoreType(type: StoreType) {
    switch (type) {
      case StoreType.UsersStore:
        this.data.update(() => this.dataSource());
        this.title.set(StoreType.UsersStore);
        break;
    }
  }

  edit(data: UsersStore | any) {
    switch (this.storeType()) {
      case StoreType.UsersStore:
        this.editData.set(data);
        // this.router.navigate(['/users/edit', data.id], { state: { data } });
        break;
    }
  }

  delete(data: any) {}

  search(event: any) {
    this.usersStore.findUser(event.target.value);
  }
}
