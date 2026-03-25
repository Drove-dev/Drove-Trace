import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { ErrorEvent, ErrorGroup } from '../../../../core/models/error-group.model';
import { ErrorsService } from '../../../../core/services/errors.service';

@Component({
  selector: 'app-error-detail-modal',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './error-detail-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorDetailModal {
  readonly group = input.required<ErrorGroup>();
  readonly visible = input.required<boolean>();
  readonly closed = output<void>();

  private errorsService = inject(ErrorsService);

  readonly latestEvent = signal<ErrorEvent | null>(null);
  readonly loadingEvent = signal<boolean>(false);

  constructor() {
    effect(() => {
      if (this.visible() && this.group()) {
        this.loadLatestEvent();
      }
    });
  }

  private loadLatestEvent(): void {
    this.loadingEvent.set(true);
    this.errorsService.getEventsByGroup(this.group().id, 1, 1).subscribe({
      next: (res) => {
        this.latestEvent.set(res.data[0] ?? null);
        this.loadingEvent.set(false);
      },
      error: () => {
        this.latestEvent.set(null);
        this.loadingEvent.set(false);
      },
    });
  }

  close(): void {
    this.closed.emit();
  }

  formatRelativeDate(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return mins + 'm ago';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    return Math.floor(hrs / 24) + 'd ago';
  }
}
