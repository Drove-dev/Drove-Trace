import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TeamSettings } from '../models/settings.model';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getTeamSettings(): Observable<TeamSettings> {
    return this.http.get<TeamSettings>(`${this.apiUrl}/settings/team`);
  }

  updateTeamSettings(payload: Partial<TeamSettings>): Observable<TeamSettings> {
    return this.http.patch<TeamSettings>(`${this.apiUrl}/settings/team`, payload);
  }

  deleteTeam(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/settings/team`);
  }
}
