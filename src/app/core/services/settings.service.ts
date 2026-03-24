import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  TeamProfile,
  UpdateTeamPayload,
  UpdateUserPayload,
  UserProfile,
} from '../models/settings.model';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getMe(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/auth/me`);
  }

  updateUser(id: string, payload: UpdateUserPayload): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`${this.apiUrl}/users/${id}`, payload);
  }

  getTeam(id: string): Observable<TeamProfile> {
    return this.http.get<TeamProfile>(`${this.apiUrl}/teams/${id}`);
  }

  updateTeam(id: string, payload: UpdateTeamPayload): Observable<TeamProfile> {
    return this.http.patch<TeamProfile>(`${this.apiUrl}/teams/${id}`, payload);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }

  deleteTeam(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/teams/${id}`);
  }
}
