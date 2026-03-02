import { effect, inject, Injectable } from '@angular/core';
import { AuthStore } from '../../store/auth/auth.store';
import { UIStore } from '../../store/ui/ui.store';

@Injectable({ providedIn: 'root' })
export class StorageSyncService {

  private authStore = inject(AuthStore);
  private uiStore = inject(UIStore);


  private syncToken = effect(() => {
      const token = this.authStore.token();
      token
        ? localStorage.setItem('token', token)
        : localStorage.removeItem('token');
    });

  private syncUI = effect(() => {
    localStorage.setItem('theme', this.uiStore.theme());
  });

  private syncLanguage = effect(() => {
    localStorage.setItem('language', this.uiStore.language());
  });

}
