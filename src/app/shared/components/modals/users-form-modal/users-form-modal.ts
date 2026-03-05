import { Component, effect, input, OnInit, output, signal } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { form, required, minLength, email, FormField } from '@angular/forms/signals';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

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
  // Signals
  data = input.required<any>();
  destroyModal = output<void>();
  visible = signal(false);
  isLoading = signal(false);
  error = signal<string | null>(null);
  isEdit = signal(false);
  isSubmitted = signal(false);

  userModel = signal<UserData>({ name: '', email: '' });

  constructor() {
    effect(() => {
      if (this.data()) {
        this.userModel.set(this.data());
        this.isEdit.set(true);
      }
    });
  }

  // Definición del esquema
  userForm = form(this.userModel, (schema) => {
    required(schema.name);
    minLength(schema.name, 3);
    required(schema.email);
    email(schema.email);
  });

  save() {
    this.isSubmitted.set(true);

    // Ejecutamos el Signal userForm() para obtener el estado actual
    if (this.userForm().valid()) {
      this.isLoading.set(true);

      // El modelo userModel() ya tiene los datos actualizados gracias a [formField]
      const dataToSend = this.userModel();

      // Simulación de llamada al servicio
      console.log('Enviando a API:', dataToSend);

      // Al terminar...
      // this.isLoading.set(false);
      // this.closeModal();
    } else {
      // Si no es válido, marcamos todo para mostrar los field-error
      Object.values(this.userForm().controlValue).forEach((control) => {
        control.markAsTouched();
      });
    }
  }

  ngOnInit(): void {
    if (this.data()) {
      this.visible.set(true);
    }
  }

  closeModal() {
    this.visible.set(false);
    this.destroyModal.emit();
  }
}
