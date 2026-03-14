import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeamMembersFormModal } from './team-members-form-modal';
import { TeamMembersStore } from '../../../../store/team-members/team-members.store';
import { signal } from '@angular/core';

describe('TeamMembersFormModal', () => {
  let component: TeamMembersFormModal;
  let fixture: ComponentFixture<TeamMembersFormModal>;
  let mockStore: any;

  beforeEach(async () => {
    mockStore = {
      isLoading: signal(false),
      statusMessage: signal('Ready'),
      updateTeam: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [TeamMembersFormModal],
      providers: [
        { provide: TeamMembersStore, useValue: mockStore }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamMembersFormModal);
    component = fixture.componentInstance;
    
    // Set required input
    fixture.componentRef.setInput('data', { id: '1', name: 'Test', role: 'Dev', user: 'user1' });
    
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
