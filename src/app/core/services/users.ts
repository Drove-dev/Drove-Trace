import { inject, Injectable } from '@angular/core';
import { User, UsersResponse } from '../models/user.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { delay, map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Users {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getUsers(page: number): Observable<UsersResponse> {
    console.log(page );

    return this.http.get<UsersResponse>(`${this.apiUrl}/users?page=${page}`)
    .pipe(
      // delay(5000),
      // map((users) => users.slice(0, 0)),
      tap((users) => console.log('Fetched users for page', users))
    );
  }

  getUserByName(name: string) {
    return this.http.get<User>(`${this.apiUrl}/users/${name}`);
  }

  createUser(user: User) {
    return this.http.post<User>(`${this.apiUrl}/users`, user);
  }

  updateUser(id: string, user: User) {
    return this.http.put<User>(`${this.apiUrl}/users/${id}`, user);
  }

  deleteUser(id: string) {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }
}
