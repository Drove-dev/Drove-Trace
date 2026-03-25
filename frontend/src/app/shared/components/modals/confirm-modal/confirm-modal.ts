import { Component, effect, inject, input, OnInit, output, signal, untracked } from '@angular/core';
import { UsersStore } from '../../../../store/stores-index';
import { LucideAngularModule } from 'lucide-angular';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'confirm-modal',
  imports: [LucideAngularModule, DialogModule, ButtonModule,],
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.css',
})
export class ConfirmModal implements OnInit {
  protected readonly store = inject(UsersStore);

  data = input.required<any>();
  destroyModal = output<void>();

  visible = signal(false);
  isDeleting = signal(false);

  constructor() {
    effect(() => {
      const isFinished = this.isDeleting() && !this.store.isLoading() && this.store.statusMessage() === 'Ready';

      if (isFinished) {
        untracked(() => this.close());
      }
    });
  }

  ngOnInit(): void {
    setTimeout(() => this.visible.set(true), 0);
  }

  confirm(): void {
    this.isDeleting.set(true);
    this.store.delete(this.data().id);
  }

  close(): void {
    this.isDeleting.set(false);
    this.visible.set(false);
    this.destroyModal.emit();
  }
}
