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
    return this.http.get<UsersResponse>(`${this.apiUrl}/users?page=${page}`)
    .pipe(
      // delay(5000),
      // map((users) => users.slice(0, 0)),
      tap((users) => console.log('Fetched users for page', users))
    );
  }

  getUserByName(name: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users/${name}`)
    // .pipe(
    //   delay(5000),
    //   // tap((updatedUser) => console.log('Updated user', updatedUser))
    // );
  }

  updateUser(user: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/${user.id}`, {name: user.name})
    // .pipe(
    //   delay(5000),
    //   tap((updatedUser) => console.log('Updated user', updatedUser))
    // );
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`)
    // .pipe(
    //   delay(5000),
    //   tap((deleted) => console.log('Deleted user', deleted))
    // );
  }
}
