export interface Project {
  id: string;
  name: string;
  environment: string;
  teamId: string;
  teamName: string;
  createdAt: string;
}

export interface PaginatedProjects {
  data: Project[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateProjectPayload {
  name: string;
  teamId: string;
  environment: string;
}

export interface UpdateProjectPayload {
  name?: string;
  teamId?: string;
  environment?: string;
}
