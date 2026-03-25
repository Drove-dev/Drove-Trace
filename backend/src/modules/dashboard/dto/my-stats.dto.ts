export class MyStatsDto {
  totalProjects: number;
  totalErrors: number;
  errorsLast24h: number;
  errorsLast7days: number;
  errorsLast30days: number;
  errorsByProject: {
    projectId: string;
    projectName: string;
    count: number;
  }[];
  topErrors: {
    fingerprint: string;
    projectName: string;
    occurrences: number;
  }[];
  lastErrorReceivedAt: Date | null;
}
