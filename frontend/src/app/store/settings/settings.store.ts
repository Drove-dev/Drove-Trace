import { computed, inject, Injectable, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, Observable, tap, throwError } from 'rxjs';
import { SettingsService } from '../../core/services/settings.service';
import {
  TeamProfile,
  UpdateTeamPayload,
  UpdateUserPayload,
  UserProfile,
} from '../../core/models/settings.model';

@Injectable({ providedIn: 'root' })
export class SettingsStore {
  private settingsService = inject(SettingsService);

  readonly userResource = rxResource({
    stream: () => this.settingsService.getMe(),
  });

  readonly teamResource = rxResource({
    params: () => this.userResource.value()?.teams?.[0]?.teamId,
    stream: (ctx) => {
      if (!ctx.params) return EMPTY;
      return this.settingsService.getTeam(ctx.params);
    },
  });

  readonly user = this.userResource.value;
  readonly team = this.teamResource.value;
  readonly isLoadingUser = this.userResource.isLoading;
  readonly isLoadingTeam = this.teamResource.isLoading;

  readonly isSavingUser = signal(false);
  readonly isSavingTeam = signal(false);
  readonly isDeletingUser = signal(false);
  readonly isDeletingTeam = signal(false);

  readonly initials = computed(() => {
    const u = this.user();
    if (!u) return '??';
    const parts = u.name?.trim().split(' ') ?? [];
    const first = parts[0]?.[0] ?? '';
    const last = parts[1]?.[0] ?? '';
    return `${first}${last}`.toUpperCase() || '??';
  });

  readonly isAdmin = computed(() =>
    this.user()?.teams?.[0]?.role === 'admin'
  );

  updateUser(payload: UpdateUserPayload): Observable<UserProfile> {
    const id = this.user()?.id;
    if (!id) return EMPTY;
    this.isSavingUser.set(true);
    return this.settingsService.updateUser(id, payload).pipe(
      tap(() => {
        this.isSavingUser.set(false);
        this.userResource.reload();
      }),
      catchError((err) => {
        this.isSavingUser.set(false);
        return throwError(() => err);
      }),
    );
  }

  updateTeam(payload: UpdateTeamPayload): Observable<TeamProfile> {
    const teamId = this.team()?.id;
    if (!teamId) return EMPTY;
    this.isSavingTeam.set(true);
    return this.settingsService.updateTeam(teamId, payload).pipe(
      tap(() => {
        this.isSavingTeam.set(false);
        this.teamResource.reload();
      }),
      catchError((err) => {
        this.isSavingTeam.set(false);
        return throwError(() => err);
      }),
    );
  }

  deleteUser(): Observable<void> {
    const id = this.user()?.id;
    if (!id) return EMPTY;
    this.isDeletingUser.set(true);
    return this.settingsService.deleteUser(id).pipe(
      catchError((err) => {
        this.isDeletingUser.set(false);
        return throwError(() => err);
      }),
    );
  }

  deleteTeam(teamId: string): Observable<void> {
    this.isDeletingTeam.set(true);
    return this.settingsService.deleteTeam(teamId).pipe(
      catchError((err) => {
        this.isDeletingTeam.set(false);
        return throwError(() => err);
      }),
    );
  }

  reload(): void {
    this.userResource.reload();
  }
}
