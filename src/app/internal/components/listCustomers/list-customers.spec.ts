import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListCustomers } from './list-customers';

describe('ListCustomers', () => {
  let component: ListCustomers;
  let fixture: ComponentFixture<ListCustomers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListCustomers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListCustomers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

