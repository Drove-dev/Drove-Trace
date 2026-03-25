import { computed, inject, Injectable, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ErrorGroup, PaginatedErrorGroups } from '../../core/models/error-group.model';
import { ErrorsService } from '../../core/services/errors.service';

@Injectable({
  providedIn: 'root',
})
export class ErrorsStore {
  private errorsService = inject(ErrorsService);

  // ── Pagination state ──────────────────────────────────────────────────────
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(15);

  // ── Selected error (detail view) ──────────────────────────────────────────
  readonly selectedError = signal<ErrorGroup | null>(null);

  // ── Resource — reacts to currentPage changes ──────────────────────────────
  private errorsResource = rxResource<PaginatedErrorGroups, number>({
    params: () => this.currentPage(),
    stream: (ctx) => this.errorsService.getErrors(ctx.params, this.pageSize()),
  });

  // ── Public signals ────────────────────────────────────────────────────────
  readonly isLoading = this.errorsResource.isLoading;

  readonly errorMsg = computed<string | null>(() => {
    const err = this.errorsResource.error();
    if (!err) return null;
    if (err instanceof Error) return err.message;
    if (typeof err === 'string') return err;
    return 'An unexpected error occurred';
  });

  readonly errorGroups = computed<ErrorGroup[]>(
    () => this.errorsResource.value()?.data ?? [],
  );

  // ── Pagination computed signals ───────────────────────────────────────────
  readonly totalItems = computed<number>(
    () => this.errorsResource.value()?.total ?? 0,
  );

  readonly totalPages = computed<number>(
    () => this.errorsResource.value()?.totalPages ?? 0,
  );

  // ── Actions ───────────────────────────────────────────────────────────────
  goToPage(page: number): void {
    this.currentPage.set(page);
  }

  selectError(error: ErrorGroup | null): void {
    this.selectedError.set(error);
  }

  reload(): void {
    this.errorsResource.reload();
  }
}
