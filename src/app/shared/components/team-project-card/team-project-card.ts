import { Component, input, output } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-team-project-card',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TagModule],
  templateUrl: './team-project-card.html',
  styleUrl: './team-project-card.css',
})
export class TeamProjectCard {
  teamGroup = input.required<any>();
  isLoading = input<boolean>(false);

  onRemove = output<string>();

  removeMember(membershipId: string) {
    this.onRemove.emit(membershipId);
  }
}
