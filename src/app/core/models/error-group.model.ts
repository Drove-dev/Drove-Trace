export type ErrorStatus =
  | 'open'
  | 'investigating'
  | 'resolved'
  | 'critical'
  | 'warning'
  | 'healthy';

export interface ErrorGroup {
  id?: string;
  title: string;
  file: string;
  line: number;
  occurrences: number;
  status: ErrorStatus;
  firstSeen: string;
  lastSeen: string;
  assignee: string | null;
  env: string;
  sparklinePoints: string;
  sparklineColor: string;
}
