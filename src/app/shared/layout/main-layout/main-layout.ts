import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UIStore } from '../../../store/ui/ui.store';
import { Navbar } from '../navbar/navbar';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Navbar, Sidebar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  uiStore = inject(UIStore);
}
