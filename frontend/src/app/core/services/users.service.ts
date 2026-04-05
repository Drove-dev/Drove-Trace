import { inject, Injectable } from '@angular/core';
import { User, PaginatedUsers, CreateUserPayload, UpdateUserPayload } from '../models/user.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  createUser(payload: CreateUserPayload): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, payload).pipe(
      tap((created) => console.log('Created user', created)),
    );
  }

  getUsers(page: number, limit: number, search: string = ''): Observable<PaginatedUsers> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
      
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PaginatedUsers>(`${this.apiUrl}/users`, { params }).pipe(
      tap((res) => console.log('Fetched users', res)),
    );
  }

  updateUser(id: string, payload: UpdateUserPayload): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/${id}`, payload).pipe(
      tap((updated) => console.log('Updated user', updated))
    );
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }
}
