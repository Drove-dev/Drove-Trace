import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ErrorGroup } from '../models/error-group.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ErrorsService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getErrors(): Observable<ErrorGroup[]> {
    return this.http.get<ErrorGroup[]>(`${this.apiUrl}/error-groups`);
  }

  getErrorById(id: string): Observable<ErrorGroup> {
    return this.http.get<ErrorGroup>(`${this.apiUrl}/error-groups/${id}`);
  }

  assignErrorToUser(
    errorId: string,
    payload: { status?: string; assigneeId?: string },
  ): Observable<ErrorGroup> {
    return this.http.patch<ErrorGroup>(`${this.apiUrl}/error-groups/${errorId}`, payload);
  }
}
