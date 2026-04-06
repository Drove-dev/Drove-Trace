import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PaginatedTeamMembers, TeamMember, CreateTeamMemberPayload, UpdateTeamMemberPayload } from '../models/team-member.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TeamMembersService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  createTeamMembership(payload: CreateTeamMemberPayload): Observable<TeamMember> {
    return this.http.post<TeamMember>(`${this.apiUrl}/team-members`, payload).pipe(
      tap((res) => console.log('Created member', res)),
    );
  }

  getTeamMemberships(page: number, limit: number, search: string = ''): Observable<PaginatedTeamMembers> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
      
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PaginatedTeamMembers>(`${this.apiUrl}/team-members`, { params }).pipe(
      tap((res) => console.log('Fetched team members', res)),
    );
  }

  updateTeamMembership(id: string, payload: UpdateTeamMemberPayload): Observable<TeamMember> {
    return this.http.patch<TeamMember>(`${this.apiUrl}/team-members/${id}`, payload).pipe(
      tap((res) => console.log('Updated member', res))
    );
  }

  removeMember(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/team-members/${id}`);
  }
}
