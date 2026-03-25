import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersFormModal } from './users-form-modal';

describe('UsersFormModal', () => {
  let component: UsersFormModal;
  let fixture: ComponentFixture<UsersFormModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersFormModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersFormModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
