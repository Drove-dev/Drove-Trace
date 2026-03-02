import { Component, effect, inject, Renderer2, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UIStore } from './store/ui/ui.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  // templateUrl: './app.html',
  template: `<router-outlet />`,
  styleUrl: './app.css'
})
export class App {
  private uiStore = inject(UIStore);
  private renderer = inject(Renderer2);

  constructor() {
    effect(() => {
      const theme = this.uiStore.theme();
      if (theme === 'dark') {
        this.renderer.addClass(document.documentElement, 'dark');
      } else {
        this.renderer.removeClass(document.documentElement, 'dark');
      }
    });
  }
}
