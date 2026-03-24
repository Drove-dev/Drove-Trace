import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateProjectPayload,
  PaginatedProjects,
  Project,
  UpdateProjectPayload,
} from '../models/project.model';

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getProjects(page = 1, limit = 15, search = ''): Observable<PaginatedProjects> {
    const params: Record<string, string> = {
      page: String(page),
      limit: String(limit),
    };
    if (search?.trim()) {
      params['search'] = search.trim();
    }
    return this.http.get<PaginatedProjects>(`${this.apiUrl}/projects`, { params });
  }

  createProject(payload: CreateProjectPayload): Observable<Project> {
    return this.http.post<Project>(`${this.apiUrl}/projects`, payload);
  }

  updateProject(id: string, payload: UpdateProjectPayload): Observable<Project> {
    return this.http.patch<Project>(`${this.apiUrl}/projects/${id}`, payload);
  }

  deleteProject(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/projects/${id}`);
  }
}
