import { describe, it, expect, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Settings } from './settings';
import { SettingsStore } from '../../../store/stores-index';
import { of } from 'rxjs';
import { TeamSettings } from '../../../core/models/settings.model';
import { signal } from '@angular/core';

describe('Settings', () => {
  let component: Settings;
  let fixture: ComponentFixture<Settings>;
  let mockStore: any;

  beforeEach(async () => {
    mockStore = {
      teamSettings: signal<TeamSettings | null>({ id: '1', name: 'Core Platform', slug: 'core-platform' }),
      notifications: signal({
        errorThresholdAlerts: true,
        weeklyDigestEmail: true,
        newMemberAlerts: false,
      }),
      isLoading: signal(false),
      isSaving: signal(false),
      isDeleting: signal(false),
      saveTeamSettings: vi.fn(),
      deleteTeam: vi.fn(),
      toggleNotification: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Settings, ReactiveFormsModule, CommonModule],
    })
    .overrideComponent(Settings, {
      set: {
        providers: [{ provide: SettingsStore, useValue: mockStore }]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(Settings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with store data', () => {
    expect(component.settingsForm.value).toEqual({
      name: 'Core Platform',
      slug: 'core-platform',
    });
  });

  it('should call store.saveTeamSettings on valid form submit', () => {
    component.settingsForm.patchValue({ name: 'New Name', slug: 'new-slug' });
    component.onSave();
    expect(mockStore.saveTeamSettings).toHaveBeenCalledWith({
      name: 'New Name',
      slug: 'new-slug',
    });
  });
});
