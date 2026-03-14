import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { StoreType } from '../../../../core/types/stores-types';
import { BasicTable } from './basic-table';

import { LucideAngularModule, Search, Pencil, Trash, DatabaseZap, LoaderPinwheel, Eye, EyeOff } from 'lucide-angular';

describe('BasicTable', () => {
  let component: BasicTable;
  let fixture: ComponentFixture<BasicTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BasicTable,
        LucideAngularModule.pick({ Search, Pencil, Trash, DatabaseZap, LoaderPinwheel, Eye, EyeOff })
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BasicTable);
    component = fixture.componentInstance;
    
    // Provide required inputs
    fixture.componentRef.setInput('dataSource', {
      isLoading: signal(false),
      statusMessage: signal('Ready'),
      data: signal([]),
      total: signal(0),
      goToPage: () => {},
      searchByName: () => {},
    });
    fixture.componentRef.setInput('storeType', StoreType.UsersStore);
    fixture.componentRef.setInput('columns', ['name', 'email', 'actions']);

    await fixture.whenStable();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
