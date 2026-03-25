import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamMembersStore } from '../../store/team-members/team-members.store';
import { TeamProjectCard } from '../../shared/components/team-project-card/team-project-card';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { LucideAngularModule } from 'lucide-angular';
import { BasicTable } from '../../shared/components';
import { StoreType } from '../../core/types/stores-types';

@Component({
  selector: 'app-team-members',
  standalone: true,
  imports: [
    CommonModule,
    MessageModule,
    SkeletonModule,
    TableModule,
    ButtonModule,
    TagModule,
    LucideAngularModule,
    // TeamMembersTable,
    BasicTable,
  ],
  templateUrl: './team-members.html',
  styleUrl: './team-members.css',
  providers: [TeamMembersStore], // Usually provided at root or route logic, but we can provide here per requirements depending on route lifecycle
})
export class TeamMembers {
  store = inject(TeamMembersStore);
  storeType = signal<StoreType>(StoreType.TeamMembersStore);

  // onRemoveMember(membershipId: string) {
  //   this.store.removeMember(membershipId);
  // }
}
