import { Component, effect, inject, input, OnInit, output, signal, untracked } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { form, required, minLength, email, FormField } from '@angular/forms/signals';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { UsersStore } from '../../../../store/stores-index';
import { User } from '../../../../core/models/user.model';

interface UserData {
  name: string;
  email: string;
}

@Component({
  selector: 'app-users-form-modal',
  imports: [DialogModule, ButtonModule, FormField, CommonModule, LucideAngularModule],
  templateUrl: './users-form-modal.html',
  styleUrl: './users-form-modal.css',
})
export class UsersFormModal implements OnInit {
  protected readonly store = inject(UsersStore);

  data = input.required<User | any>();
  destroyModal = output<void>();

  visible = signal(false);
  isSaving = signal(false);
  userModel = signal<UserData>({ name: '', email: '' });

  userForm = form(this.userModel, (schema) => {
    required(schema.name);
    minLength(schema.name, 3);
  });

  constructor() {
    effect(() => {
      const isFinished =
        this.isSaving() && !this.store.isLoading() && this.store.statusMessage() === 'Ready';

      if (isFinished) {
        untracked(() => this.close());
      }
    });
  }

  ngOnInit(): void {
    this.userModel.set({ ...this.data() });
    console.log(this.data());
    setTimeout(() => this.visible.set(true), 0);
  }

  save(): void {
    if (this.userForm().invalid()) {
      this.userForm().markAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.store.updateUser(this.userModel());
  }

  close(): void {
    this.isSaving.set(false);
    this.visible.set(false);
    this.destroyModal.emit();
  }
}
