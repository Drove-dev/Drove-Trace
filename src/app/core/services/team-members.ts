import { inject, Injectable } from '@angular/core';
import { delay, map, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { TeamMemberList, TeamMember, } from '../models/team-member.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TeamMembersService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getTeamMemberships(page:number): Observable<TeamMemberList> {

    return this.http.get<TeamMemberList>(`${this.apiUrl}/team-members?page=${page}`)
    // .pipe(
    //   delay(5000),
    //   tap((updatedUser) => console.log('Updated user', updatedUser))
    // );
  }

  getTeamMembershipsByName(name:string): Observable<any> {
    return this.http.get<TeamMemberList>(`${this.apiUrl}/team-members/${name}`).pipe(delay(1000));
  }

  updateTeamMembersShips(team: Partial<TeamMember>): Observable<TeamMemberList> {
    return this.http.patch<TeamMemberList>(`${this.apiUrl}/team-members/${team.id}`, {name: team })
    // .pipe(
    //   delay(5000),
    //   tap((updatedUser) => console.log('Updated user', updatedUser))
    // );
  }

  removeMember(membershipId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/team-members/${membershipId}`);
  }
}
