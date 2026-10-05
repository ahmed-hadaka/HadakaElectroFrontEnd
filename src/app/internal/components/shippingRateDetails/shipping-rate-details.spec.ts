import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShippingRateDetails } from './shipping-rate-details';

describe('ShippingRateDetails', () => {
  let component: ShippingRateDetails;
  let fixture: ComponentFixture<ShippingRateDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShippingRateDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(ShippingRateDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
