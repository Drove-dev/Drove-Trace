import { computed, inject, Injectable, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { map, tap } from 'rxjs';
import { TeamSettings, NotificationSettings } from '../../core/models/settings.model';
import { SettingsService } from '../../core/services/settings.service';

type SettingsAction =
  | { type: 'IDLE' }
  | { type: 'LOADING' }
  | { type: 'SAVING'; payload: Partial<TeamSettings> }
  | { type: 'DELETING' };

@Injectable({
  providedIn: 'root',
})
export class SettingsStore {
  private settingsService = inject(SettingsService);

  private state = signal<SettingsAction>({ type: 'LOADING' });

  // Local notification settings as signals
  readonly notifications = signal<NotificationSettings>({
    errorThresholdAlerts: true,
    weeklyDigestEmail: true,
    newMemberAlerts: false,
  });

  readonly settingsResource = rxResource<TeamSettings | null, SettingsAction>({
    params: () => this.state(),
    stream: (ctx) => {
      const action = ctx.params;
      switch (action.type) {
        case 'SAVING':
          return this.settingsService.updateTeamSettings(action.payload);
        case 'DELETING':
          return this.settingsService.deleteTeam().pipe(
            map(() => null)
          );
        case 'LOADING':
        default:
          return this.settingsService.getTeamSettings();
      }
    }
  });

  readonly teamSettings = computed(() => this.settingsResource.value());
  readonly isLoading = this.settingsResource.isLoading;
  readonly isSaving = computed(() => this.state().type === 'SAVING');
  readonly isDeleting = computed(() => this.state().type === 'DELETING');

  saveTeamSettings(payload: Partial<TeamSettings>) {
    this.state.set({ type: 'SAVING', payload });
  }

  deleteTeam() {
    this.state.set({ type: 'DELETING' });
  }

  toggleNotification(key: keyof NotificationSettings) {
    this.notifications.update(n => ({
      ...n,
      [key]: !n[key]
    }));
  }

  reload() {
    this.settingsResource.reload();
  }
}
