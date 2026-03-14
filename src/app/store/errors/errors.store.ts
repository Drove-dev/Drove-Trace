import { computed, inject, Injectable, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ErrorGroup } from '../../core/models/error-group.model';
import { ErrorsService } from '../../core/services/errors.service';

type StoreAction =
  | { type: 'IDLE' }
  | { type: 'LOADING' }
  | { type: 'ERROR'; message: string }
  | { type: 'UPDATING' };

@Injectable({
  providedIn: 'root', // Singleton for the whole app
})
export class ErrorsStore {
  private errorsService = inject(ErrorsService);

  // Internal state tracking status
  private statusState = signal<StoreAction>({ type: 'LOADING' });

  // Selected error (for detail view later)
  readonly selectedError = signal<ErrorGroup | null>(null);

  // rxResource for managing the async data
  readonly errorsResource = rxResource<ErrorGroup[], StoreAction>({
    params: () => this.statusState(),
    stream: (ctx) => {
      const action = ctx.params;

      // Execute the request
      return this.errorsService.getErrors();
    },
  });

  // Public Computed Signals

  // Gets the exact data array from rxResource
  readonly errorGroups = computed(() => this.errorsResource.value() ?? []);

  // Loading status
  readonly isLoading = this.errorsResource.isLoading;
  readonly errorMsg = computed(() => {
    const s = this.statusState();
    return s.type === 'ERROR' ? s.message : null;
  });

  // Filtered computed signal exactly as requested: filtering by criticality.
  // We assume 'open', 'critical' are Critical. 'warning', 'investigating' are Warning.
  readonly criticalErrors = computed(() => {
    return this.errorGroups().filter((e) => e.status === 'open' || e.status === 'critical');
  });

  readonly warningErrors = computed(() => {
    return this.errorGroups().filter((e) => e.status === 'investigating' || e.status === 'warning');
  });

  readonly infoErrors = computed(() => {
    return this.errorGroups().filter((e) => e.status === 'resolved' || e.status === 'healthy');
  });

  // Actions

  reload() {
    this.statusState.set({ type: 'LOADING' });
    this.errorsResource.reload();
  }

  selectError(error: ErrorGroup | null) {
    this.selectedError.set(error);
  }
  // errors.store.ts
  assignUser(errorId: string, userId: string) {
    this.statusState.set({ type: 'UPDATING' }); // Cambiamos el estado a actualizando

    this.errorsService.assignErrorToUser(errorId, { assigneeId: userId }).subscribe({
      next: (updatedError) => {
        // ACTUALIZACIÓN DE SIGNAL:
        // Buscamos el error en la lista y actualizamos solo ese objeto
        // this.errorGroups.update((list: ErrorGroup[]) =>
        //   list.map(e => e.id === errorId ? updatedError : e)
        // );
        this.errorsResource.reload();
        this.statusState.set({ type: 'IDLE' });
      },
      error: (err) => {
        this.statusState.set({ type: 'ERROR', message: 'Failed to assign user' });
      },
    });
  }
}
