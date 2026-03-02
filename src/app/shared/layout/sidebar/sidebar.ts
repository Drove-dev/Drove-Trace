import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UIStore } from '../../../store/ui/ui.store';
import { LucideAngularModule } from 'lucide-angular';


  export interface NavItem {
    label: string;
    icon: string;
    route: string;
  }

  export const NAV_ITEMS: NavItem[] = [
    { label: 'Dashboard', icon: 'layout-dashboard', route: '/dashboard' },
    { label: 'Users',     icon: 'users',             route: '/users' },
    { label: 'Reports',   icon: 'chart-bar',         route: '/reports' },
    { label: 'Settings',  icon: 'settings',          route: '/settings' },
  ];


@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  uiStore = inject(UIStore);
  navItems = NAV_ITEMS;

  toggleTheme() {
    const next = this.uiStore.theme() === 'dark' ? 'light' : 'dark';
    this.uiStore.setTheme(next);
  }

}
