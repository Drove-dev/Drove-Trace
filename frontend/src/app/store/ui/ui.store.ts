
import { computed, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

export interface Notification {
  id: string;
  message: string;
  read: boolean;
}

export class UIStore {

  // Estado
  private _sidebarCollapsed = signal<boolean>(false);
  private _theme = signal<Theme>('light');
  private _language = signal<string>('en');
  private _notifications = signal<Notification[]>([]);

  // Solo lectura
  readonly sidebarCollapsed = this._sidebarCollapsed.asReadonly();
  readonly theme = this._theme.asReadonly();
  readonly language = this._language.asReadonly();
  readonly notifications = this._notifications.asReadonly();

  // Computed
  readonly unreadCount = computed(() =>
    this._notifications().filter(n => !n.read).length
  );

  // Métodos
  toggleSidebar() {
    this._sidebarCollapsed.update(v => !v);
  }

  setTheme(theme: Theme) { this._theme.set(theme); }
  setLanguage(lang: string) { this._language.set(lang); }

  addNotification(notification: Notification) {
    this._notifications.update(list => [...list, notification]);
  }

  markAsRead(id: string) {
    this._notifications.update(list =>
      list.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }
}
