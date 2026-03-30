import { ChangeDetectionStrategy, Component, input, OnInit, output, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-delete-confirm-modal',
  standalone: true,
  imports: [LucideAngularModule, DialogModule],
  templateUrl: './delete-confirm-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteConfirmModal implements OnInit {
  // ── Inputs ──
  readonly title = input<string>('Delete item');
  readonly message = input<string>('This action cannot be undone.');
  readonly isLoading = input<boolean>(false);

  // ── Outputs ──
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  readonly visible = signal(false);

  ngOnInit(): void {
    setTimeout(() => this.visible.set(true), 0);
  }

  confirm(): void {
    this.confirmed.emit();
  }

  cancel(): void {
    this.visible.set(false);
    setTimeout(() => this.cancelled.emit(), 150); // allow close animation
  }
}
