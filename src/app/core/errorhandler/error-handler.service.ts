import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { AuthStore } from '../../store/auth/auth.store';
import type { ToastOptions, ToastSeverity, BackendErrorBody } from './error-handler.models';

const DEFAULT_TOAST_LIFE_MS = 5000;

/** Mapeo de severidad del dominio a severity de PrimeNG */
const SEVERITY_MAP: Record<ToastSeverity, string> = {
  danger: 'error',
  warning: 'warn',
  success: 'success',
  information: 'info',
};

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  private readonly messageService = inject(MessageService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  /**
   * Maneja un error: si es 401 hace logout y redirige; en cualquier caso muestra toast.
   * Pensado para uso desde el interceptor HTTP y desde cualquier módulo (excepto auth).
   */
  handleError(error: HttpErrorResponse | { status?: number; message?: string; error?: BackendErrorBody }): void {
    const status = this.getStatus(error);
    const isAuthError = status === 401;

    if (isAuthError) {
      this.authStore.logout();
      this.router.navigate(['/auth/login']);
      this.showToast({
        summary: 'Sesión expirada',
        detail: 'Tu sesión ha terminado. Inicia sesión de nuevo.',
        severity: 'information',
        life: DEFAULT_TOAST_LIFE_MS,
      });
      return;
    }

    const { summary, detail } = this.getSummaryAndDetail(error);
    this.showToast({
      summary,
      detail,
      severity: this.severityFromStatus(status),
      life: DEFAULT_TOAST_LIFE_MS,
    });
  }

  /**
   * Muestra un toast con las opciones dadas. Útil para notificaciones manuales (éxito, avisos, etc.).
   */
  showToast(options: ToastOptions): void {
    const life = options.life ?? DEFAULT_TOAST_LIFE_MS;
    const severity = SEVERITY_MAP[options.severity];
    this.messageService.add({
      key: 'global',
      severity,
      summary: options.summary,
      detail: options.detail,
      life,
    });
  }

  private getStatus(error: HttpErrorResponse | { status?: number }): number | undefined {
    if (error instanceof HttpErrorResponse) {
      return error.status;
    }
    return error.status;
  }

  private getSummaryAndDetail(
    error: HttpErrorResponse | { status?: number; message?: string; error?: BackendErrorBody }
  ): { summary: string; detail: string } {
    if (error instanceof HttpErrorResponse) {
      const body = error.error as BackendErrorBody | undefined;
      const summary = body?.error ?? `Error ${error.status}`;
      const detail =
        typeof body?.message === 'string'
          ? body.message
          : Array.isArray(body?.details)
            ? (body.details as string[]).join(' ')
            : error.message || 'Ha ocurrido un error inesperado.';
      return { summary: String(summary), detail };
    }
    const msg = error.message ?? (error.error as BackendErrorBody)?.message ?? 'Ha ocurrido un error.';
    return {
      summary: `Error ${error.status ?? 'desconocido'}`,
      detail: typeof msg === 'string' ? msg : JSON.stringify(msg),
    };
  }

  private severityFromStatus(status: number | undefined): ToastSeverity {
    if (status == null) return 'danger';
    if (status >= 500) return 'danger';
    if (status === 404) return 'warning';
    if (status >= 400) return 'danger';
    return 'information';
  }
}
