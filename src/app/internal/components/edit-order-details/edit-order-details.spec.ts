import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditOrderDetails } from './edit-order-details';

describe('EditOrderDetails', () => {
  let component: EditOrderDetails;
  let fixture: ComponentFixture<EditOrderDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditOrderDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(EditOrderDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
