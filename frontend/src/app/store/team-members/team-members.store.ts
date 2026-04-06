import { computed, inject, Injectable, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TeamMembersService } from '../../core/services/team-members';
import {
  CreateTeamMemberPayload,
  PaginatedTeamMembers,
  TeamMember,
  UpdateTeamMemberPayload,
} from '../../core/models/team-member.model';

@Injectable({ providedIn: 'root' })
export class TeamMembersStore {
  private teamService = inject(TeamMembersService);

  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(15);
  readonly searchQuery = signal<string>('');
  readonly selectedMember = signal<TeamMember | null>(null);

  readonly teamMembersResource = rxResource<
    PaginatedTeamMembers,
    { page: number; search: string; limit: number }
  >({
    params: () => ({
      page: this.currentPage(),
      search: this.searchQuery(),
      limit: this.pageSize(),
    }),
    stream: (ctx) =>
      this.teamService.getTeamMemberships(ctx.params.page, ctx.params.limit, ctx.params.search),
  });

  readonly members = computed(() => this.teamMembersResource.value()?.data ?? []);
  readonly totalItems = computed(() => this.teamMembersResource.value()?.total ?? 0);
  readonly totalPages = computed(() => this.teamMembersResource.value()?.totalPages ?? 0);
  readonly isLoading = this.teamMembersResource.isLoading;

  readonly hasPrevPage = computed(() => this.currentPage() > 1);
  readonly hasNextPage = computed(() => this.currentPage() < this.totalPages());

  readonly error = computed<string | null>(() => {
    const err = this.teamMembersResource.error();
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

  selectMember(member: TeamMember | null): void {
    this.selectedMember.set(member);
  }

  reload(): void {
    this.teamMembersResource.reload();
  }

  createMember(payload: CreateTeamMemberPayload): Observable<TeamMember> {
    return this.teamService.createTeamMembership(payload).pipe(tap(() => this.reload()));
  }

  updateMember(id: string, payload: UpdateTeamMemberPayload): Observable<TeamMember> {
    return this.teamService.updateTeamMembership(id, payload).pipe(tap(() => this.reload()));
  }

  deleteMember(id: string): Observable<void> {
    return this.teamService.removeMember(id).pipe(tap(() => this.reload()));
  }
}
