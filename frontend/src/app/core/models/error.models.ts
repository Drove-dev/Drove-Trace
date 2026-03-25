export type ErrorStatus = 'open' | 'investigating' | 'resolved';
export type ErrorCriticality = 'critical' | 'warning' | 'info';

export interface ErrorGroup {
  id: string;
  type: string; // Ej: 'TypeError'
  message: string; // Ej: 'Cannot read properties of undefined'
  file: string; // Ej: 'checkout.js'
  line: number; // Ej: 142
  occurrences: number; // Ej: 891
  lastSeen: Date | string;
  status: ErrorStatus;
  criticality: ErrorCriticality;
  environment: 'production' | 'staging' | 'development';
  project: string;
  // Para el mini-gráfico del prototipo
  history: number[]; // Array de números para dibujar el SVG
}
