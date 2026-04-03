import { computed, inject, Injectable, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { map, Observable, tap } from 'rxjs';
import {
  CreateTeamPayload,
  Team,
  TeamsResponse,
  UpdateTeamPayload,
} from '../../core/models/team.model';
import { TeamsService } from '../../core/services/teams.service';

@Injectable({ providedIn: 'root' })
export class TeamsStore {
  private teamsService = inject(TeamsService);

  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);
  readonly searchQuery = signal<string>('');

  readonly teamsResource = rxResource<
    TeamsResponse,
    { page: number; limit: number; search: string }
  >({
    params: () => ({
      page: this.currentPage(),
      search: this.searchQuery(),
      limit: this.pageSize(),
    }),
    stream: (ctx) =>
      this.teamsService.getTeams(ctx.params.page, ctx.params.limit, ctx.params.search),
  });

  readonly teams = computed(() => this.teamsResource.value()?.data ?? []);
  readonly totalItems = computed(() => this.teamsResource.value()?.total ?? 0);
  readonly totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));
  readonly isLoading = this.teamsResource.isLoading;

  readonly hasPrevPage = computed(() => this.currentPage() > 1);
  readonly hasNextPage = computed(() => this.currentPage() < this.totalPages());

  readonly error = computed<string | null>(() => {
    const err = this.teamsResource.error();
    if (!err) return null;
    if (err instanceof Error) return err.message;
    return 'An unexpected error occurred';
  });

  goToPage(page: number): void {
    const total = this.totalPages();
    if (page < 1 || (total > 0 && page > total)) return;
    this.currentPage.set(page);
  }

  search(query: string): void {
    this.currentPage.set(1);
    this.searchQuery.set(query);
  }

  reload(): void {
    this.teamsResource.reload();
  }

  createTeam(payload: CreateTeamPayload): Observable<Team> {
    return this.teamsService.createTeam(payload).pipe(tap(() => this.reload()));
  }

  updateTeam(id: string, payload: UpdateTeamPayload): Observable<Team> {
    return this.teamsService.updateTeam(id, payload).pipe(tap(() => this.reload()));
  }

  deleteTeam(id: string): Observable<void> {
    return this.teamsService.deleteTeam(id).pipe(tap(() => this.reload()));
  }
}
