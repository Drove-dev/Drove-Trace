export class DashboardStatsDto {
  totalUsers: number;
  totalTeams: number;
  totalProjects: number;
  totalErrors: number;
  errorsByProject: { projectId: string; projectName: string; count: number }[];
  errorsByEnvironment: { environment: string; count: number }[];
  errorsLast24h: number;
  errorsLast7days: number;
  errorsLast30days: number;
  topErrors: { fingerprint: string; projectName: string; occurrences: number }[];
  activeSdkKeys: number;
  inactiveSdkKeys: number;
}
