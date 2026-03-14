import { computed, inject, Injectable, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { map, tap } from 'rxjs';
import { SdkKey, SdkKeyList } from '../../core/models/sdk-key.model';
import { SdkKeysService } from '../../core/services/sdk-keys';

type SdkKeysAction =
  | { type: 'IDLE' }
  | { type: 'LOADING_PAGE'; page: number }
  | { type: 'SEARCHING'; name: string }
  | { type: 'GENERATING'; key: Partial<SdkKey> }
  | { type: 'REVOKING'; id: string };

@Injectable({
  providedIn: 'root',
})
export class SdkKeysStore {
  private sdkKeysService = inject(SdkKeysService);

  private state = signal<SdkKeysAction>({ type: 'LOADING_PAGE', page: 1 });

  readonly sdkKeysResource = rxResource<SdkKeyList, SdkKeysAction>({
    params: () => this.state(),
    stream: (ctx) => {
      const action = ctx.params;
      switch (action.type) {
        case 'SEARCHING':
          return this.sdkKeysService.getSdkKeysByName(action.name).pipe(
            map((response) => {
              return { data: response, total: response.length };
            }),
          );
        case 'GENERATING':
          return this.sdkKeysService.generateKey(action.key).pipe(
            map(() => ({ data: [], total: 1 })),
            tap(() => this.goToPage(1))
          );
        case 'REVOKING':
          return this.sdkKeysService.revokeKey(action.id).pipe(
            tap(() => this.goToPage(1))
          );
        case 'LOADING_PAGE':
          return this.sdkKeysService.getSdkKeys(action.page);
        default:
          return this.sdkKeysService.getSdkKeys(1);
      }
    }
  });

  readonly statusMessage = computed(() => {
    const s = this.state();
    if (!this.sdkKeysResource.isLoading()) return 'Ready';
    if (s.type === 'SEARCHING') return `Searching for "${s.name}"...`;
    if (s.type === 'GENERATING') return 'Generating key...';
    if (s.type === 'REVOKING') return 'Revoking key...';
    return 'Loading keys...';
  });

  readonly data = computed(() => this.sdkKeysResource.value()?.data ?? []);
  readonly total = computed(() => this.sdkKeysResource.value()?.total ?? 0);
  readonly isLoading = this.sdkKeysResource.isLoading;

  goToPage(page: number) {
    this.state.set({ type: 'LOADING_PAGE', page });
  }

  searchByName(name: string) {
    if (name.length >= 3) {
      this.state.set({ type: 'SEARCHING', name });
    } else if (name.length === 0) {
      this.goToPage(1);
    }
  }

  generate(key: Partial<SdkKey>) {
    this.state.set({ type: 'GENERATING', key });
  }

  revoke(id: string) {
    this.state.set({ type: 'REVOKING', id });
  }

  reload() {
    this.sdkKeysResource.reload();
  }
}
