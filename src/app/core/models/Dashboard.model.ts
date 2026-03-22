export interface DashboardErrorByProject {
  projectId: string;
  projectName: string;
  count: number;
}

export interface DashboardErrorByEnvironment {
  environment: string;
  count: number;
}

export interface DashboardTopError {
  fingerprint: string;
  projectName: string;
  occurrences: number;
}

export interface DashboardSummary {
  totalUsers: number;
  totalTeams: number;
  totalProjects: number;
  totalErrors: number;
  errorsLast24h: number;
  errorsLast7days: number;
  errorsLast30days: number;
  errorsByProject: DashboardErrorByProject[];
  errorsByEnvironment: DashboardErrorByEnvironment[];
  topErrors: DashboardTopError[];
  activeSdkKeys: number;
  inactiveSdkKeys: number;
}
