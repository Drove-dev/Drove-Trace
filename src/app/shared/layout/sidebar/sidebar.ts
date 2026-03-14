import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UIStore } from '../../../store/ui/ui.store';
import { LucideAngularModule } from 'lucide-angular';
import { CommonModule } from '@angular/common';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: 'layout-dashboard', route: '/dashboard' },
  { label: 'Error Groups', icon: 'triangle-alert', route: '/error-groups' },
  { label: 'Projects', icon: 'box', route: '/projects' },
  { label: 'Users', icon: 'users', route: '/users' },
  { label: 'Team Members', icon: 'users', route: '/team-members' },
  { label: 'SDK Keys', icon: 'key', route: '/sdk-keys' },
  { label: 'Settings', icon: 'settings', route: '/settings' },
];

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule, CommonModule],
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
