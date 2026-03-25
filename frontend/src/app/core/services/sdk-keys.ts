import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SdkKey, SdkKeyList } from '../models/sdk-key.model';

@Injectable({
  providedIn: 'root',
})
export class SdkKeysService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getSdkKeys(page: number): Observable<SdkKeyList> {
    return this.http.get<SdkKeyList>(`${this.apiUrl}/sdk-keys?page=${page}`);
  }

  getSdkKeysByName(name: string): Observable<SdkKey[]> {
    return this.http.get<SdkKey[]>(`${this.apiUrl}/sdk-keys/search/by-name?name=${name}`);
  }

  generateKey(key: Partial<SdkKey>): Observable<SdkKey> {
    return this.http.post<SdkKey>(`${this.apiUrl}/sdk-keys`, key);
  }

  revokeKey(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/sdk-keys/${id}`);
  }
}
