import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { TeamsStore } from '../../../../store/teams/teams.store';
import { UsersService } from '../../../../core/services/users.service';
import { Team, CreateTeamPayload, UpdateTeamPayload } from '../../../../core/models/team.model';
import { UsersResponse } from '../../../../core/models/user.model';

@Component({
  selector: 'app-team-form-modal',
  standalone: true,
  imports: [LucideAngularModule, ReactiveFormsModule],
  templateUrl: './team-form-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamFormModal {
  readonly team = input<Team | null>(null);
  readonly visible = input.required<boolean>();

  readonly closed = output<void>();
  readonly saved = output<void>();

  private teamsStore = inject(TeamsStore);
  private usersService = inject(UsersService);
  private fb = inject(FormBuilder);

  readonly isSaving = signal<boolean>(false);
  readonly users = signal<{ id: string; name: string }[]>([]);
  readonly isEdit = computed(() => !!this.team());

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    ownerId: ['', [Validators.required]],
  });

  constructor() {
    effect(() => {
      if (this.visible()) {
        const t = this.team();
        if (t) {
          // Edit mode: only name is updated in the payload
          this.form.patchValue({ name: t.name });
          // ownerId is not needed for edit payload but we keep it valid if it was required
          this.form.get('ownerId')?.clearValidators();
          this.form.get('ownerId')?.updateValueAndValidity();
        } else {
          // Create mode
          this.loadUsers();
          this.form.reset({ name: '', ownerId: '' });
          this.form.get('ownerId')?.setValidators([Validators.required]);
          this.form.get('ownerId')?.updateValueAndValidity();
        }
      }
    });
  }

  private loadUsers(): void {
    this.usersService.getUsers(1).subscribe({
      next: (res: UsersResponse) => {
        this.users.set(res.data.map((u) => ({ id: u.id, name: u.name ?? u.email })) ?? []);
      },
      error: () => this.users.set([]),
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const formValue = this.form.getRawValue();
    const t = this.team();

    if (this.isEdit() && t) {
      const payload: UpdateTeamPayload = { name: formValue.name };
      this.teamsStore.updateTeam(t.id, payload).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.saved.emit();
        },
        error: () => this.isSaving.set(false),
      });
    } else {
      const payload: CreateTeamPayload = {
        name: formValue.name,
        ownerId: formValue.ownerId,
      };
      this.teamsStore.createTeam(payload).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.saved.emit();
        },
        error: () => this.isSaving.set(false),
      });
    }
  }

  close(): void {
    this.closed.emit();
  }
}
