import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../../store/auth/auth.store';
import { email, form, FormField, required } from '@angular/forms/signals';
import { LucideAngularModule } from 'lucide-angular';


interface LoginData {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  imports: [FormField, LucideAngularModule],
  templateUrl: './login.html',
})
export class Login {

  private authStore = inject(AuthStore);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);
    showPassword = signal(false);


  loginModel = signal<LoginData>({ email: '', password: ''});

  form = form(this.loginModel, (schema) => {
    required(schema.email),
    email(schema.email),
    required(schema.password)
    // pattern(schema.password, /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/);
    });

  submit(event: Event) {
    event.preventDefault();

    this.loading.set(true);
    this.error.set(null);

     if (this.form.email().invalid() || this.form.password().invalid()) return;

    this.authStore.login(this.loginModel()).subscribe(
      {
        next: () => this.router.navigate(['/dashboard']),
        error: () => {
          this.error.set('Invalid credentials');
          this.loading.set(false);
        }
      });
  }
}
