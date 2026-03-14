import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SettingsStore } from '../../../store/stores-index';

import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
  providers: [SettingsStore],
})
export class Settings {
  private fb = inject(FormBuilder);
  readonly store = inject(SettingsStore);

  settingsForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    slug: ['', [Validators.required]],
  });

  constructor() {
    // Sync form with store data
    effect(() => {
      const data = this.store.teamSettings();
      if (data) {
        this.settingsForm.patchValue({
          name: data.name,
          slug: data.slug,
        }, { emitEvent: false });
      }
    });
  }

  onSave() {
    if (this.settingsForm.valid) {
      this.store.saveTeamSettings(this.settingsForm.value);
    }
  }

  onDeleteTeam() {
    if (confirm('Are you sure you want to delete this team? This action is permanent.')) {
      this.store.deleteTeam();
    }
  }

  toggleNotification(key: 'errorThresholdAlerts' | 'weeklyDigestEmail' | 'newMemberAlerts') {
    this.store.toggleNotification(key);
  }
}
