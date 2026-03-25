import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { DashboardSummary } from '../../core/models/Dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class Dashboard {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getStats() {
    return this.http.get<DashboardSummary>(`${this.apiUrl}/dashboard/stats`);
  }

}
