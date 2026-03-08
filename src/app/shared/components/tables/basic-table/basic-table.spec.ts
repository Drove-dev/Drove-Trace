import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicTable } from './basic-table';

describe('BasicTable', () => {
  let component: BasicTable;
  let fixture: ComponentFixture<BasicTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BasicTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
