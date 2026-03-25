import { Component, effect, inject, input, OnInit, output, signal, untracked } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { form, required, minLength, FormField } from '@angular/forms/signals';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { SelectModule } from 'primeng/select';
import { SdkKeysStore } from '../../../../store/stores-index';
import { SdkKey } from '../../../../core/models/sdk-key.model';

interface SdkKeyData {
  name: string;
  project: string;
  environment: string;
}

@Component({
  selector: 'app-sdk-keys-form-modal',
  standalone: true,
  imports: [DialogModule, ButtonModule, FormField, CommonModule, LucideAngularModule, SelectModule],
  templateUrl: './sdk-keys-form-modal.html',
  styleUrl: './sdk-keys-form-modal.css',
})
export class SdkKeysFormModal implements OnInit {
  protected readonly store = inject(SdkKeysStore);

  data = input<SdkKey | any>();
  destroyModal = output<void>();

  visible = signal(false);
  isSaving = signal(false);
  sdkKeyModel = signal<SdkKeyData>({ name: '', project: '', environment: 'development' });

  environments = [
    { label: 'Development', value: 'development' },
    { label: 'Staging', value: 'staging' },
    { label: 'Production', value: 'production' }
  ];

  sdkKeyForm = form(this.sdkKeyModel, (schema) => {
    required(schema.name);
    minLength(schema.name, 3);
    required(schema.project);
    required(schema.environment);
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
    if (this.data()) {
      this.sdkKeyModel.set({
        name: this.data().name || '',
        project: this.data().project || '',
        environment: this.data().environment || 'development'
      });
    }
    setTimeout(() => this.visible.set(true), 0);
  }

  save(): void {
    if (this.sdkKeyForm().invalid()) {
      this.sdkKeyForm().markAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.store.generate(this.sdkKeyModel() as Partial<SdkKey>);
  }

  close(): void {
    this.isSaving.set(false);
    this.visible.set(false);
    this.destroyModal.emit();
  }
}
