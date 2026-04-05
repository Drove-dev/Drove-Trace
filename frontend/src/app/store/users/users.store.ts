import { computed, inject, Injectable, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UsersService } from '../../core/services/users.service';
import {
  CreateUserPayload,
  PaginatedUsers,
  UpdateUserPayload,
  User,
} from '../../core/models/user.model';

@Injectable({ providedIn: 'root' })
export class UsersStore {
  private usersService = inject(UsersService);

  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(15);
  readonly searchQuery = signal<string>('');
  readonly selectedUser = signal<User | null>(null);

  readonly usersResource = rxResource<
    PaginatedUsers,
    { page: number; search: string; limit: number }
  >({
    params: () => ({
      page: this.currentPage(),
      search: this.searchQuery(),
      limit: this.pageSize(),
    }),
    stream: (ctx) =>
      this.usersService.getUsers(ctx.params.page, ctx.params.limit, ctx.params.search),
  });

  readonly users = computed(() => this.usersResource.value()?.data ?? []);
  readonly totalItems = computed(() => this.usersResource.value()?.total ?? 0);
  readonly totalPages = computed(() => this.usersResource.value()?.totalPages ?? 0);
  readonly isLoading = this.usersResource.isLoading;

  readonly hasPrevPage = computed(() => this.currentPage() > 1);
  readonly hasNextPage = computed(() => this.currentPage() < this.totalPages());

  readonly error = computed<string | null>(() => {
    const err = this.usersResource.error();
    if (!err) return null;
    if (err instanceof Error) return err.message;
    return 'An unexpected error occurred';
  });

  goToPage(page: number): void {
    const total = this.totalPages();
    if (page < 1 || page > total) return;
    this.currentPage.set(page);
  }

  search(query: string): void {
    this.currentPage.set(1);
    this.searchQuery.set(query);
  }

  selectUser(user: User | null): void {
    this.selectedUser.set(user);
  }

  reload(): void {
    this.usersResource.reload();
  }

  createUser(payload: CreateUserPayload): Observable<User> {
    return this.usersService.createUser(payload).pipe(tap(() => this.reload()));
  }

  updateUser(id: string, payload: UpdateUserPayload): Observable<User> {
    return this.usersService.updateUser(id, payload).pipe(tap(() => this.reload()));
  }

  deleteUser(id: string): Observable<void> {
    return this.usersService.deleteUser(id).pipe(tap(() => this.reload()));
  }
}
