import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './page-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeader {
  // ── Header ──
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');

  // ── Error state ──
  readonly error = input<string | null>(null);

  // ── Search ──
  readonly searchPlaceholder = input<string>('Search...');
  readonly searchEvent = output<string>();

  // ── View toggle ──
  readonly viewMode = input<'grid' | 'list'>('grid');
  readonly viewModeChange = output<'grid' | 'list'>();

  // ── Action button ──
  readonly actionLabel = input<string>('');
  readonly actionEvent = output<void>();

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchEvent.emit(value);
  }
}
