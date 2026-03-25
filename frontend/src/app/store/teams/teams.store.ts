import { computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { map, tap } from 'rxjs';
import { Team, TeamsResponse, UpdateTeamPayload } from '../../core/models/team.model';
import { TeamsService } from '../../core/services/teams.service';

type StoreAction =
  | { type: 'IDLE' }
  | { type: 'LOADING_PAGE'; page: number }
  | { type: 'SEARCHING'; name: string }
  | { type: 'UPDATING'; id: string; payload: UpdateTeamPayload }
  | { type: 'DELETING'; id: string };

export class TeamsStore {
  private teamsService = inject(TeamsService);
  private state = signal<StoreAction>({ type: 'LOADING_PAGE', page: 1 });

  readonly teamsResource = rxResource<TeamsResponse, StoreAction>({
    params: () => this.state(),
    stream: (ctx) => {
      const action = ctx.params;
      switch (action.type) {
        case 'SEARCHING':
          return this.teamsService.getTeamByName(action.name).pipe(
            map((data) => ({ data, total: data.length })),
          );
        case 'UPDATING':
          return this.teamsService.updateTeam(action.id, action.payload).pipe(
            map(() => ({ data: [], total: 0 })),
            tap(() => this.goToPage(1)),
          );
        case 'DELETING':
          return this.teamsService.deleteTeam(action.id).pipe(
            map(() => ({ data: [], total: 0 })),
            tap(() => this.goToPage(1)),
          );
        case 'LOADING_PAGE':
        default:
          return this.teamsService.getTeams(action.type === 'LOADING_PAGE' ? action.page : 1);
      }
    },
  });

  readonly statusMessage = computed(() => {
    const s = this.state();
    if (!this.teamsResource.isLoading()) return 'Ready';
    if (s.type === 'SEARCHING') return `Searching for "${s.name}"...`;
    if (s.type === 'UPDATING') return 'Updating team...';
    if (s.type === 'DELETING') return 'Deleting team...';
    return 'Loading teams...';
  });

  readonly data = computed(() => this.teamsResource.value()?.data ?? []);
  readonly total = computed(() => this.teamsResource.value()?.total ?? 0);
  readonly isLoading = this.teamsResource.isLoading;

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

  update(id: string, payload: UpdateTeamPayload) {
    this.state.set({ type: 'UPDATING', id, payload });
  }

  delete(id: string) {
    this.state.set({ type: 'DELETING', id });
  }

  reload() {
    this.teamsResource.reload();
  }
}
