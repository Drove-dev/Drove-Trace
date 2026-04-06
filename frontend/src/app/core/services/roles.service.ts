import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PaginatedRoles } from '../models/role.model';

@Injectable({ providedIn: 'root' })
export class RolesService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getRoles(): Observable<PaginatedRoles> {
    return this.http.get<any>(`${this.apiUrl}/roles`).pipe(
      map(res => {
        if (Array.isArray(res)) return { data: res, total: res.length };
        if (res && res.data) return res as PaginatedRoles;
        return { data: [], total: 0 };
      })
    );
  }
}
