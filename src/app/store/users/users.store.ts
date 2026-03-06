import { computed, inject, signal } from '@angular/core';
import { User } from '../../core/models/user.model';
import { Users } from '../../core/services/index';
import { of } from 'rxjs';
import { rxResource } from '@angular/core/rxjs-interop';

export class UsersStore {
  private usersService = inject(Users);

  readonly currentPage = signal(1);
  readonly searchByName = signal<string>('');

  readonly usersResource = rxResource({
    params: () => ({ page: this.currentPage() }),
    stream: (ctx) => this.usersService.getUsers(ctx.params.page),
  });

  readonly filteredList = computed(() => {
    const list = this.usersResource.value()?.data ?? [];
    const term = this.searchByName().toLowerCase().trim();

    if (!term) return list;

    return list.filter((u) => u.name.toLowerCase().includes(term));
  });

  readonly apiSearchResource = rxResource({
    params: () => ({ name: this.searchByName() }),
    stream: (ctx) => {
      const name = ctx.params.name.toLowerCase().trim();

      if (name.length < 3 || this.filteredList().length > 0) {
        return of(null);
      }

      return this.usersService.getUserByName(name);
    },
  });

  readonly selectedUser = computed(() => {
    if (this.filteredList().length > 0 && this.searchByName().length > 0) {
      return this.filteredList()[0];
    }
    return this.apiSearchResource.value();
  });

  readonly isLoading = computed(
    () =>
      this.usersResource.isLoading() ||
      (this.apiSearchResource.isLoading() && this.searchByName().length >= 3),
  );

  findUser(name: string) {
    this.searchByName.set(name);
  }

  add(user: User) {
    this.usersService.createUser(user).subscribe({
      next: (newUser) => {
        // this.usersResource.update((current) => [newUser, ...(current ?? [])]);
        this.usersResource.update((current) => {
          if (!current) return { data: [newUser], total: 1 };
          return {
            ...current,
            data: [newUser, ...current.data],
            total: current.total + 1
          };
        });
      },
      error: (err) => console.error('Error al crear:', err),
    });
  }

  remove(id: string) {
    this.usersService.deleteUser(id).subscribe({
      next: () => {
        // this.usersResource.update((current) => current?.filter((u) => u.id !== id));
        this.usersResource.update((current) => {
          if (!current) return current;
          return {
            ...current,
            data: current.data.filter((u) => u.id !== id),
            total: current.total - 1
          };
        });
      },
      error: (err) => console.error('Error al borrar:', err),
    });
  }

  reload() {
    this.usersResource.reload();
  }
}
