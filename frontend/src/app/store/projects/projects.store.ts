import { computed, inject, Injectable, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ProjectsService } from '../../core/services/projects.service';
import {
  CreateProjectPayload,
  PaginatedProjects,
  Project,
  UpdateProjectPayload,
} from '../../core/models/project.model';

@Injectable({ providedIn: 'root' })
export class ProjectsStore {
  private projectsService = inject(ProjectsService);

  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(15);
  readonly searchQuery = signal<string>('');
  readonly selectedProject = signal<Project | null>(null);

  readonly projectsResource = rxResource<
    PaginatedProjects,
    { page: number; search: string; limit: number }
  >({
    params: () => ({
      page: this.currentPage(),
      search: this.searchQuery(),
      limit: this.pageSize(),
    }),
    stream: (ctx) =>
      this.projectsService.getProjects(ctx.params.page, ctx.params.limit, ctx.params.search),
  });

  readonly projects = computed(() => this.projectsResource.value()?.data ?? []);
  readonly totalItems = computed(() => this.projectsResource.value()?.total ?? 0);
  readonly totalPages = computed(() => this.projectsResource.value()?.totalPages ?? 0);
  readonly isLoading = this.projectsResource.isLoading;

  readonly hasPrevPage = computed(() => this.currentPage() > 1);
  readonly hasNextPage = computed(() => this.currentPage() < this.totalPages());

  readonly error = computed<string | null>(() => {
    const err = this.projectsResource.error();
    if (!err) return null;
    if (err instanceof Error) return err.message;
    return 'An unexpected error occurred';
  });

  goToPage(page: number): void {
    const total = this.totalPages();
    if (page < 1 || page > total) return;
    this.currentPage.set(page);
  }

  search(query: string): void {
    this.currentPage.set(1);
    this.searchQuery.set(query);
  }

  selectProject(project: Project | null): void {
    this.selectedProject.set(project);
  }

  reload(): void {
    this.projectsResource.reload();
  }

  createProject(payload: CreateProjectPayload): Observable<Project> {
    return this.projectsService.createProject(payload).pipe(tap(() => this.reload()));
  }

  updateProject(id: string, payload: UpdateProjectPayload): Observable<Project> {
    return this.projectsService.updateProject(id, payload).pipe(tap(() => this.reload()));
  }

  deleteProject(id: string): Observable<void> {
    return this.projectsService.deleteProject(id).pipe(tap(() => this.reload()));
  }
}
