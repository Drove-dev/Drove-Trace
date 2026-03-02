import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Credentials, User } from '../models/user.model';

export interface LoginResponse {
    id:    string;
    email: string;
    name:  string;
    token: string;
    roles?: string[];
}


@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  login(credentials: Credentials) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials);
  }

  logout() {
    return this.http.post(`${this.apiUrl}/auth/logout`, {});
  }

  getMe() {
    return this.http.get<{ user: User }>(`${this.apiUrl}/auth/me`);
  }
}
