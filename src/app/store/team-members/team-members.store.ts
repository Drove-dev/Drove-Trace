import { computed, inject, Injectable, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TeamMembersService } from '../../core/services/team-members';
import { TeamMember, TeamMemberList } from '../../core/models/team-member.model';
import { map, tap } from 'rxjs';

type TeamMembersAction =
  | { type: 'IDLE' }
  | { type: 'LOADING_PAGE'; page: number }
  | { type: 'SEARCHING'; team: string }
  | { type: 'UPDATING'; member: Partial<TeamMember>} //TODO: assign interface
  | { type: 'DELETING'; id: string };




@Injectable({
  providedIn: 'root',
})
export class TeamMembersStore {
  private readonly teamService = inject(TeamMembersService);


    private state = signal<TeamMembersAction>({ type: 'LOADING_PAGE', page: 1 });

    readonly teamMembersResource = rxResource<TeamMemberList, TeamMembersAction>({
      params: () => this.state(),
      stream: (ctx) => {
        const action = ctx.params;
        switch (action.type) {
          case 'SEARCHING':
            return this.teamService.getTeamMembershipsByName(action.team ).pipe(
              map((res) => {
                return { data: res, total: res.length };
              }),
            );
          case 'UPDATING':
            return this.teamService.updateTeamMembersShips( action.member ).pipe(
              map(() => ({ data: [], total: 1 })),
              tap(() => this.goToPage(1))
            )
          case 'DELETING':
            return this.teamService.removeMember(action.id).pipe(
              tap(() => this.goToPage(1))
            );
          case 'LOADING_PAGE': return this.teamService.getTeamMemberships(action.page);
          default:             return this.teamService.getTeamMemberships(1);
        }
      }
    });

    readonly statusMessage = computed(() => {
      const s = this.state();
      if (!this.teamMembersResource.isLoading()) return 'Ready';
      if (s.type === 'SEARCHING') return `Searching for "${s.team}"...`;
      if (s.type === 'UPDATING') return 'Updating user...';
      if (s.type === 'DELETING') return 'Deleting user...';
      return 'Loading Team member...';
    });

    readonly data = computed(() => this.teamMembersResource.value()?.data ?? []);
    readonly total = computed(() => this.teamMembersResource.value()?.total ?? 0);
    readonly isLoading = this.teamMembersResource.isLoading;

    goToPage(page: number) {
      this.state.set({ type: 'LOADING_PAGE', page });
    }

    searchByTeam(team: string) {
      if (team.length >= 3) {
        this.state.set({ type: 'SEARCHING', team });
      } else if (team.length === 0) {
        this.goToPage(1);
      }
    }

    updateTeam(member: any) {
      this.state.set({ type: 'UPDATING', member });
    }

    delete(id: string) {
      this.state.set({ type: 'DELETING', id });
    }

    reload() {
      this.teamMembersResource.reload();
    }
  }
