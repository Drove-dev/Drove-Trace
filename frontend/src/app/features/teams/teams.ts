import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { TeamsStore } from '../../store/teams/teams.store';
import { BasicTable } from '../../shared/components/tables/basic-table/basic-table';
import { StoreType } from '../../core/types/stores-types';
import { LucideAngularModule } from 'lucide-angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [BasicTable, LucideAngularModule, CommonModule],
  templateUrl: './teams.html',
  providers: [TeamsStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Teams {
  readonly teamsStore = inject(TeamsStore);
  readonly storeType = signal<StoreType>(StoreType.TeamsStore);
}
