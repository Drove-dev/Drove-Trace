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
import { User } from '../../../../core/models/user.model';
import { ConfirmModal } from '../../modals/confirm-modal/confirm-modal';

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
    ConfirmModal
  ],
  templateUrl: './basic-table.html',
  styleUrl: './basic-table.css',
})
export class BasicTable implements OnInit {
  private usersStore = inject(UsersStore);

  // Inputs
  // Nota: Si el dataSource ya es el UsersStore, puedes usarlo directamente
  dataSource = input.required<UsersStore>();
  storeType = input.required<StoreType>();
  columns = input.required<string[]>(); // Corregido typo 'colunms'
  tableStyles = {
    root: 'w-full overflow-x-auto',
    table: 'w-full border-collapse text-left text-sm',
    thead: 'table-header',
    tbody: 'divide-y divide-[var(--border)]',
  };

  // Form Modal & UI State
  editData = signal<User | null>(null); // Ahora guarda el Usuario, no el Store
  deleteData = signal<User | null>(null);
  title = signal<string>('');

  ngOnInit(): void {
    this.title.set(this.storeType());
  }

  // Evento del Paginador (PrimeNG u otro)
  onPageChange(event: any) {
    // Calculamos la página (PrimeNG usa 'first' como índice, lo pasamos a número de página)
    const pageNumber = event.first / event.rows + 1;
    this.dataSource().goToPage(pageNumber);
  }

  search(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource().searchByName(filterValue);
  }

  edit(user: User) {
    this.editData.set(user);
  }

  delete(user: User) {
    this.deleteData.set(user);
    }
}

