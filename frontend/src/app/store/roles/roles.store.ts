import { computed, inject, Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RolesService } from '../../core/services/roles.service';
import { PaginatedRoles } from '../../core/models/role.model';

@Injectable({ providedIn: 'root' })
export class RolesStore {
  private rolesService = inject(RolesService);

  readonly rolesResource = rxResource<PaginatedRoles, void>({
    stream: () => this.rolesService.getRoles()
  });

  readonly roles = computed(() => this.rolesResource.value()?.data ?? []);
  readonly isLoading = this.rolesResource.isLoading;

  readonly error = computed<string | null>(() => {
    const err = this.rolesResource.error();
    if (!err) return null;
    if (err instanceof Error) return err.message;
    return 'An unexpected error occurred';
  });

  reload(): void {
    this.rolesResource.reload();
  }
}
