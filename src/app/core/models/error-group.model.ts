export interface ErrorGroup {
  id: string;
  fingerprint: string;
  firstSeen: string;
  lastSeen: string;
  occurrences: number;
  projectId: string;
  projectName: string;
}

export interface PaginatedErrorGroups {
  data: ErrorGroup[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ErrorEvent {
  id: string;
  message: string;
  fingerprint: string;
  environment: string;
  file: string;
  line: number;
  browser: string;
  os: string;
  url: string;
  projectId: string;
  createdAt: string;
}
