import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ErrorEvent, ErrorGroup, PaginatedErrorGroups } from '../models/error-group.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ErrorsService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getErrors(page = 1, limit = 15): Observable<PaginatedErrorGroups> {
    return this.http.get<PaginatedErrorGroups>(`${this.apiUrl}/error-groups`, {
      params: { page, limit },
    });
  }

  getErrorById(id: string): Observable<ErrorGroup> {
    return this.http.get<ErrorGroup>(`${this.apiUrl}/error-groups/${id}`);
  }

  getEventsByGroup(
    groupId: string,
    page = 1,
    limit = 1,
  ): Observable<{ data: ErrorEvent[]; total: number }> {
    return this.http.get<{ data: ErrorEvent[]; total: number }>(
      `${this.apiUrl}/error-events/by-group/${groupId}`,
      { params: { page, limit } },
    );
  }

  assignErrorToUser(
    errorId: string,
    payload: { status?: string; assigneeId?: string },
  ): Observable<ErrorGroup> {
    return this.http.patch<ErrorGroup>(`${this.apiUrl}/error-groups/${errorId}`, payload);
  }
}
