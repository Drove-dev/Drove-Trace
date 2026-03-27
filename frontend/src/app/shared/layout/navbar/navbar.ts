import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../../store/auth/auth.store';
import { UIStore } from '../../../store/ui/ui.store';
import { LucideAngularModule } from 'lucide-angular';
import { SettingsStore } from '../../../store/stores-index';

@Component({
  selector: 'app-navbar',
  imports: [LucideAngularModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  authStore = inject(AuthStore);
  settingsStore = inject(SettingsStore);
  uiStore = inject(UIStore);
  private router = inject(Router);

  logout() {
    this.authStore.logout();
    this.router.navigate(['/auth/login']);
  }
}
