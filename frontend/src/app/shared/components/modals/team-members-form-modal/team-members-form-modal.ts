import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { TeamMembersStore } from '../../../../store/team-members/team-members.store';
import { CreateTeamMemberPayload, TeamMember } from '../../../../core/models/team-member.model';

import { TeamsService } from '../../../../core/services';
import { UsersService } from '../../../../core/services/users.service';
import { RolesStore } from '../../../../store/roles/roles.store';
import { User } from '../../../../core/models/user.model';
import { TeamsResponse } from '../../../../core/models/team.model';

@Component({
  selector: 'app-team-members-form-modal',
  standalone: true,
  imports: [LucideAngularModule, ReactiveFormsModule],
  templateUrl: './team-members-form-modal.html',
})
export class TeamMembersFormModal {
  readonly member = input<TeamMember | null>(null);
  readonly visible = input.required<boolean>();

  readonly closed = output<void>();
  readonly saved = output<void>();

  private teamMembersStore = inject(TeamMembersStore);
  private teamsService = inject(TeamsService);
  private usersService = inject(UsersService);
  readonly rolesStore = inject(RolesStore);
  private fb = inject(FormBuilder);

  readonly isSaving = signal<boolean>(false);
  readonly isEdit = computed(() => !!this.member());

  readonly teams = signal<{ id: string; name: string }[]>([]);
  readonly users = signal<User[]>([]);

  readonly form = this.fb.nonNullable.group({
    teamId: ['', [Validators.required]],
    userId: ['', [Validators.required]],
    roleId: ['', [Validators.required]],
  });

  constructor() {
    effect(() => {
      if (this.visible()) {
        const m = this.member();

        untracked(() => {
          this.loadDependencies();
        });

        if (m) {
          this.form.patchValue({
            // teamId is patched async inside loadDependencies when teams resolve
            userId: m.userId ?? '',
            roleId: m.roleId ?? '',
          });
          
          this.form.controls.teamId.disable();
          this.form.controls.userId.enable();
          this.form.controls.roleId.enable();
        } else {
          this.form.reset({ teamId: '', userId: '', roleId: '' });
          this.form.controls.teamId.enable();
          this.form.controls.userId.enable();
          this.form.controls.roleId.enable();
        }
      }
    });
  }

  private loadDependencies(): void {
    const isEdit = this.isEdit();
    const currentMember = this.member();

    this.teamsService.getTeams(1, 15).subscribe({
      next: (res: any) => {
        // Safe parsing depending on backend variation
        const data = Array.isArray(res) ? res : (res.data ?? []);
        this.teams.set(data);

        // Patch the team ID async if editing once loaded
        if (isEdit && currentMember) {
          const match = data.find((t: any) => t.name === currentMember.teamName);
          const theTeamId = match?.id || (currentMember as any).teamId || currentMember.id || '';
          this.form.patchValue({ teamId: theTeamId });
        }
      },
      error: () => this.teams.set([]),
    });

    this.usersService.getUsers(1, 15).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : (res.data ?? []);
        this.users.set(data);
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
    const payload = this.form.getRawValue() as CreateTeamMemberPayload;
    
    const action$ = this.isEdit()
      ? this.teamMembersStore.updateMember(this.member()!.id, payload)
      : this.teamMembersStore.createMember(payload);

    action$.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.saved.emit();
      },
      error: () => this.isSaving.set(false),
    });
  }

  close(): void {
    this.closed.emit();
  }
}
