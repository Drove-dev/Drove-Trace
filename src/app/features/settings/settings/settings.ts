import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { SettingsStore } from '../../../store/settings/settings.store';
import { UpdateUserPayload } from '../../../core/models/settings.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [LucideAngularModule, ReactiveFormsModule],
  templateUrl: './settings.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Settings {
  readonly store = inject(SettingsStore);

  readonly profileForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    newPassword:     new FormControl('', { nonNullable: true }),
    confirmPassword: new FormControl('', { nonNullable: true }),
  });

  readonly teamForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
  });

  constructor() {
    effect(() => {
      const u = this.store.user();
      if (u) {
        this.profileForm.patchValue({ name: u.name }, { emitEvent: false });
      }
    });
    effect(() => {
      const t = this.store.team();
      if (t) {
        this.teamForm.patchValue({ name: t.name }, { emitEvent: false });
      }
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    const { name, newPassword, confirmPassword } = this.profileForm.getRawValue();
    if (newPassword && newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    const payload: UpdateUserPayload = { name };
    if (newPassword) payload.password = newPassword;
    this.store.updateUser(payload).subscribe();
  }

  saveTeam(): void {
    if (this.teamForm.invalid) {
      this.teamForm.markAllAsTouched();
      return;
    }
    const { name } = this.teamForm.getRawValue();
    this.store.updateTeam({ name }).subscribe();
  }

  deleteAccount(): void {
    if (confirm('Delete your account permanently? This cannot be undone.')) {
      this.store.deleteUser().subscribe();
    }
  }

  deleteTeam(teamId: string): void {
    if (confirm('Delete this team permanently? All projects and error logs will be wiped.')) {
      this.store.deleteTeam(teamId).subscribe();
    }
  }
}
