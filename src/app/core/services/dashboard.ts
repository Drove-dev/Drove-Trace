import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { DashboardSummary } from '../../store/dashboard/dashboard.store';

@Injectable({
  providedIn: 'root',
})
export class Dashboard {
    private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getErrorGroups() {
    return this.http.get<DashboardSummary>(`${this.apiUrl}/error-groups`);
  }

}
