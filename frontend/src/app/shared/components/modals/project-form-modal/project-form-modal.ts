import {
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
import { ProjectsStore } from '../../../../store/projects/projects.store';

import { CreateProjectPayload, Project } from '../../../../core/models/project.model';
import { TeamsService } from '../../../../core/services';
import { TeamsResponse } from '../../../../core/models/team.model';

@Component({
  selector: 'app-project-form-modal',
  imports: [LucideAngularModule, ReactiveFormsModule],
  templateUrl: './project-form-modal.html',
})
export class ProjectFormModal {
  readonly project = input<Project | null>(null);
  readonly visible = input.required<boolean>();

  readonly closed = output<void>();
  readonly saved = output<void>();

  private projectsStore = inject(ProjectsStore);
  private teamsService = inject(TeamsService);
  private fb = inject(FormBuilder);

  readonly isSaving = signal<boolean>(false);
  readonly teams = signal<{ id: string; name: string }[]>([]);
  readonly isEdit = computed(() => !!this.project());

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    teamId: ['', [Validators.required]],
    environment: ['production' as 'production' | 'staging' | 'dev', [Validators.required]],
  });

  constructor() {
    effect(() => {
      if (this.visible()) {
        this.loadTeams();
        const p = this.project();
        if (p) {
          this.form.patchValue({
            name: p.name,
            environment: p.environment as 'production' | 'staging' | 'dev',
          });
        } else {
          this.form.reset({ environment: 'production', name: '', teamId: '' });
        }
      }
    });
  }

  private loadTeams(): void {
    this.teamsService.getTeams(1, 15).subscribe({
      next: (res: TeamsResponse) => {
        this.teams.set(res.data ?? []);
        const p = this.project();
        if (p) {
          this.form.patchValue({ teamId: p.teamId });
        }
      },
      error: () => this.teams.set([]),
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const payload = this.form.getRawValue() as CreateProjectPayload;
    const action$ = this.isEdit()
      ? this.projectsStore.updateProject(this.project()!.id, payload)
      : this.projectsStore.createProject(payload);

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
