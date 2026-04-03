import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { delay, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateTeamPayload, Team, TeamsResponse, UpdateTeamPayload } from '../models/team.model';

@Injectable({ providedIn: 'root' })
export class TeamsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getTeams(page = 1, limit = 15, search = ''): Observable<TeamsResponse> {
    const params: Record<string, string> = {
      page: String(page),
      limit: String(limit),
    };
    if (search?.trim()) {
      params['search'] = search.trim();
    }
    return this.http.get<TeamsResponse>(`${this.apiUrl}/teams`, { params }).pipe(delay(3000));
  }

  createTeam(payload: CreateTeamPayload): Observable<Team> {
    return this.http.post<Team>(`${this.apiUrl}/teams`, payload).pipe(delay(1000));
  }

  updateTeam(id: string, payload: UpdateTeamPayload): Observable<Team> {
    return this.http.patch<Team>(`${this.apiUrl}/teams/${id}`, payload);
  }

  deleteTeam(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/teams/${id}`);
  }
}
