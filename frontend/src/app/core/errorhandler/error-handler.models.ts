/**
 * Severidad del toast (mapeada a PrimeNG: error, warn, success, info).
 */
export type ToastSeverity = 'danger' | 'warning' | 'success' | 'information';

/**
 * Opciones para mostrar un toast.
 */
export interface ToastOptions {
  /** Título/resumen del mensaje */
  summary: string;
  /** Descripción detallada */
  detail: string;
  /** Tipo de mensaje */
  severity: ToastSeverity;
  /** Duración en ms antes de cerrar (ej. 3000–5000). Opcional. */
  life?: number;
}

/**
 * Formato típico de error devuelto por el backend (opcional).
 * Permite parsear y rellenar summary/detail en el interceptor.
 */
export interface BackendErrorBody {
  message?: string;
  error?: string;
  code?: string | number;
  status?: number;
  details?: string | string[] | Record<string, unknown>;
}
