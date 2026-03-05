import { inject, Injectable, DOCUMENT } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from '../../store/auth/auth.store';
import { UIStore } from '../../store/ui/ui.store';
import { Theme } from '../../store/ui/ui.store';
import { Auth } from '../services/index';

@Injectable({ providedIn: 'root' })
export class AppInitializer {

  private authStore = inject(AuthStore);
  private uiStore = inject(UIStore);
  private document = inject(DOCUMENT);

  async run(): Promise<void> {
    // Restore UI preferences
    const theme = (localStorage.getItem('theme') as Theme) ?? 'dark';
    const language = localStorage.getItem('language') ?? 'es';
    this.uiStore.setTheme(theme);
    this.uiStore.setLanguage(language);

    // 2. Restore auth state from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      try {
        this.authStore.setToken(token);
        // const { user } = await firstValueFrom(
        //   inject(Auth).getMe()
        // );
        // this.authStore.setUser(user);
      } catch {
        // Token expired or invalid → clear everything
        localStorage.removeItem('token');
        this.authStore.logout();
      }
    }
  }
}

