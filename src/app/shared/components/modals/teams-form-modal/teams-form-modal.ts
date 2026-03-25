import {
  Component,
  inject,
  input,
  output,
  signal,
  computed,
  effect,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { TeamsService } from '../../../../core/services/teams.service';
import { SettingsStore } from '../../../../store/settings/settings.store';
import { CreateTeamPayload, UpdateTeamPayload } from '../../../../core/models/team.model';
import { CustomFormData } from '../../../../core/models/custom-form-data.model';

@Component({
  selector: 'app-teams-form-modal',
  standalone: true,
  imports: [LucideAngularModule, ReactiveFormsModule],
  templateUrl: './teams-form-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamsFormModal {
  readonly data = input.required<CustomFormData | null>();
  readonly destroyModal = output<void>();

  private teamsService = inject(TeamsService);
  readonly settingsStore = inject(SettingsStore);

  readonly isSaving = signal(false);
  readonly isEdit = computed(() => !!this.data()?.data?.id);

  readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2), Validators.maxLength(255)],
    }),
  });

  constructor() {
    effect(() => {
      const d = this.data()?.data;
      if (d?.id) {
        this.form.patchValue({ name: d.name });
      } else {
        this.form.reset();
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);
    const { name } = this.form.getRawValue();
    const d = this.data()?.data;

    if (this.isEdit() && d?.id) {
      const payload: UpdateTeamPayload = { name };
      this.teamsService.updateTeam(d.id, payload).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.destroyModal.emit();
        },
        error: () => this.isSaving.set(false),
      });
    } else {
      const ownerId = this.settingsStore.user()?.id;
      if (!ownerId) {
        this.isSaving.set(false);
        return;
      }
      const payload: CreateTeamPayload = { name, ownerId };
      this.teamsService.createTeam(payload).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.destroyModal.emit();
        },
        error: () => this.isSaving.set(false),
      });
    }
  }

  close(): void {
    this.destroyModal.emit();
  }
}
