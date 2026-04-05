import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { UsersStore } from '../../../../store/users/users.store';
import { CreateUserPayload, User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-users-form-modal',
  imports: [LucideAngularModule, ReactiveFormsModule],
  templateUrl: './users-form-modal.html',
})
export class UsersFormModal {
  readonly user = input<User | null>(null);
  readonly visible = input.required<boolean>();

  readonly closed = output<void>();
  readonly saved = output<void>();

  private usersStore = inject(UsersStore);
  private fb = inject(FormBuilder);

  readonly isSaving = signal<boolean>(false);
  readonly isEdit = computed(() => !!this.user());

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
  });

  constructor() {
    effect(() => {
      if (this.visible()) {
        const u = this.user();
        if (u) {
          this.form.patchValue({
            name: u.name,
            email: u.email,
          });
          this.form.controls.email.disable(); // Email typically shouldn't be editable.
        } else {
          this.form.reset({ name: '', email: '' });
          this.form.controls.email.enable();
        }
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const payload = this.form.getRawValue() as CreateUserPayload;
    
    // In edit mode we might only send name, but getRawValue gets enabled and disabled fields if we specify it or rely on just value. Wait, disabled fields aren't in value, but we need it. For update we only send name according to payload.
    const action$ = this.isEdit()
      ? this.usersStore.updateUser(this.user()!.id, { name: payload.name })
      : this.usersStore.createUser(payload);

    action$.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.saved.emit();
      },
      error: () => this.isSaving.set(false),
    });
  }

  close(): void {
    this.closed.emit();
  }
}
