
import { computed, inject } from '@angular/core';
import { signal } from '@angular/core';
import { User, Credentials } from '../../core/models/user.model';
import { Auth } from '../../core/services/auth';
import { tap } from 'rxjs';


export class AuthStore {
  private authService = inject(Auth);

  // Estado
  private _user = signal<User | null>(null);
  private _token = signal<string | null>(null);
  private _roles = signal<string[]>([]);

  readonly user = this._user.asReadonly();
  readonly token = this._token.asReadonly();
  readonly roles = this._roles.asReadonly();


  readonly isAuthenticated = computed(() => !!this._token());

  readonly name = computed(() => this._user() ? `${this._user()?.name}`: '' );

  // readonly isAdmin = computed(() => this._roles().includes('admin'));

  // Métodos
  login(credentials: Credentials) {
    return this.authService.login(credentials).pipe(
      tap(({ token, email, name, roles }) => {
        this._token.set(token);
        this._user.set({ email, name } as User);
        this._roles.set( !roles ? [] : roles); // Aquí podrías setear roles si los tienes en la respuesta
      })
    );
  }

  logout() {
    this._user.set(null);
    this._token.set(null);
  }

  setToken(token: string) { this._token.set(token); }

  setUser(user: User) {
    this._user.set(user);
  }
}
