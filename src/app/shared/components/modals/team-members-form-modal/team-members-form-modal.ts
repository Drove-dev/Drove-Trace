import { Component, effect, inject, input, OnInit, output, signal, untracked } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { form, required, minLength, FormField } from '@angular/forms/signals';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { TeamMembersStore } from '../../../../store/team-members/team-members.store';
import { TeamMember } from '../../../../core/models/team-member.model';

interface TeamMemberData {
  name: string;
  role: string;
  user: string;
}

@Component({
  selector: 'app-team-members-form-modal',
  standalone: true,
  imports: [DialogModule, ButtonModule, FormField, CommonModule, LucideAngularModule],
  templateUrl: './team-members-form-modal.html',
  styleUrl: './team-members-form-modal.css',
})
export class TeamMembersFormModal implements OnInit {
  protected readonly store = inject(TeamMembersStore);

  data = input.required<TeamMember | any>();
  destroyModal = output<void>();

  visible = signal(false);
  isSaving = signal(false);
  teamMemberModel = signal<TeamMemberData>({ name: '', role: '', user: '' });

  teamMemberForm = form(this.teamMemberModel, (schema) => {
    required(schema.name);
    minLength(schema.name, 3);
    required(schema.role);
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
    this.teamMemberModel.set({
      name: this.data().name || '',
      role: this.data().role || '',
      user: this.data().user || '',
    });
    setTimeout(() => this.visible.set(true), 0);
  }

  save(): void {
    if (this.teamMemberForm().invalid()) {
      this.teamMemberForm().markAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.store.updateTeam({
        ...this.data(),
        ...this.teamMemberModel()
    });
  }

  close(): void {
    this.isSaving.set(false);
    this.visible.set(false);
    this.destroyModal.emit();
  }
}
