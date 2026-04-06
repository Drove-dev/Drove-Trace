import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { SdkKeysStore } from '../../store/stores-index';
import { StoreType } from '../../core/types/stores-types';

@Component({
  selector: 'app-sdk-keys',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
  ],
  templateUrl: './sdk-keys.html',
  styleUrl: './sdk-keys.css',
  providers: [SdkKeysStore],
})
export class SdkKeys {
  store = inject(SdkKeysStore);
  storeType = signal<StoreType>(StoreType.SdkKeysStore);
  
  columns = signal<string[]>(['name', 'project', 'key', 'environment', 'status', 'createdAt', 'actions']);

  revealedKeys = signal<Record<string, boolean>>({});

  toggleKey(id: string) {
    this.revealedKeys.update(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  }

  isRevealed(id: string): boolean {
    return !!this.revealedKeys()[id];
  }

  getMaskedKey(key: string): string {
    return '••••••••••••••••••••••••••••••••••••••••';
  }

}
