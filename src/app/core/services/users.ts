import { inject, Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { delay, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Users {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getUsers(getNextPage: number): Observable<User[]> {
    // ?skip=${skip}&limit=${limit}

    return this.http.get<User[]>(`${this.apiUrl}/users`);
    // .pipe(
    //   delay(5000),
    //   // map((users) => users.slice(0, 0)),
    // );
  }

  getUserById(id: string) {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`);
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
