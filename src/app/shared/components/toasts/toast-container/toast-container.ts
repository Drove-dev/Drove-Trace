import { Component, input } from '@angular/core';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [ToastModule],
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.css',
})
export class ToastContainer {
  /** Duración en ms que el toast permanece visible. Por defecto 5000. */
  life = input<number>(5000);
}
