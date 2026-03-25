import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ProjectsStore } from '../../store/projects/projects.store';
import { Project } from '../../core/models/project.model';
import { ProjectFormModal } from '../../shared/components/modals/project-form-modal/project-form-modal';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [LucideAngularModule, ReactiveFormsModule, ProjectFormModal],
  templateUrl: './projects.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Projects {
  readonly projectsStore = inject(ProjectsStore);

  readonly viewMode = signal<'grid' | 'list'>('grid');
  readonly showFormModal = signal<boolean>(false);
  readonly editingProject = signal<Project | null>(null);
  readonly deletingId = signal<string | null>(null);

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.projectsStore.search(input.value);
  }

  openCreate(): void {
    this.editingProject.set(null);
    this.showFormModal.set(true);
  }

  openEdit(project: Project, event: Event): void {
    event.stopPropagation();
    this.editingProject.set(project);
    this.showFormModal.set(true);
  }

  closeModal(): void {
    this.showFormModal.set(false);
    this.editingProject.set(null);
  }

  confirmDelete(id: string, event: Event): void {
    event.stopPropagation();
    this.deletingId.set(id);
    this.projectsStore.deleteProject(id).subscribe({
      next: () => this.deletingId.set(null),
      error: () => this.deletingId.set(null),
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-GB');
  }

  getEnvClass(env: string): string {
    switch (env) {
      case 'production':
        return 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400';
      case 'staging':
        return 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500';
      default:
        return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    }
  }

  getIconColor(env: string): string {
    switch (env) {
      case 'production':
        return '#534AB7';
      case 'staging':
        return '#854F0B';
      default:
        return '#0F6E56';
    }
  }

  getIconBg(env: string): string {
    switch (env) {
      case 'production':
        return 'bg-indigo-50 dark:bg-indigo-500/10';
      case 'staging':
        return 'bg-amber-50 dark:bg-amber-500/10';
      default:
        return 'bg-emerald-50 dark:bg-emerald-500/10';
    }
  }
}
