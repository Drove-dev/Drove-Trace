import { computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { map, tap } from 'rxjs';
import { User, UsersResponse } from '../../core/models/user.model';
import { Users } from '../../core/services/users';

type StoreAction =
  | { type: 'IDLE' }
  | { type: 'LOADING_PAGE'; page: number }
  | { type: 'SEARCHING'; name: string }
  | { type: 'UPDATING'; user: Partial<User> }
  | { type: 'DELETING'; id: string };

export class UsersStore {
  private usersService = inject(Users);

  private state = signal<StoreAction>({ type: 'LOADING_PAGE', page: 1 });

  readonly usersResource = rxResource<UsersResponse, StoreAction>({
    params: () => this.state(),
    stream: (ctx) => {
      const action = ctx.params;
      switch (action.type) {
        case 'SEARCHING':
          return this.usersService.getUserByName(action.name).pipe(
            map((response) => {
              return { data: response,total: response.length };
            }),
          );
        case 'UPDATING':
          return this.usersService.updateUser(action.user).pipe(
            map(() => ({ data: [], total: 1 })),
            tap(() => this.goToPage(1))
          )
        case 'DELETING':
          return this.usersService.deleteUser(action.id).pipe(
            tap(() => this.goToPage(1))
          );
        case 'LOADING_PAGE': return this.usersService.getUsers(action.page);
        default:             return this.usersService.getUsers(1);
      }
    }
  });

  readonly statusMessage = computed(() => {
    const s = this.state();
    if (!this.usersResource.isLoading()) return 'Ready';
    if (s.type === 'SEARCHING') return `Searching for "${s.name}"...`;
    if (s.type === 'UPDATING') return 'Updating user...';
    if (s.type === 'DELETING') return 'Deleting user...';
    return 'Loading users...';
  });

  readonly data = computed(() => this.usersResource.value()?.data ?? []);
  readonly total = computed(() => this.usersResource.value()?.total ?? 0);
  readonly isLoading = this.usersResource.isLoading;

  goToPage(page: number) {
    this.state.set({ type: 'LOADING_PAGE', page });
  }

  searchByName(name: string) {
    if (name.length >= 3) {
      this.state.set({ type: 'SEARCHING', name });
    } else if (name.length === 0) {
      this.goToPage(1);
    }
  }

  updateUser(user: any) {
    this.state.set({ type: 'UPDATING', user });
  }

  delete(id: string) {
    this.state.set({ type: 'DELETING', id });
  }

  reload() {
    this.usersResource.reload();
  }
}
