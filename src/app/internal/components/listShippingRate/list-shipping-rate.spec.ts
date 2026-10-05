import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShippingRate } from './list-shipping-rate';

describe('ShippingRate', () => {
  let component: ShippingRate;
  let fixture: ComponentFixture<ShippingRate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShippingRate],
    }).compileComponents();

    fixture = TestBed.createComponent(ShippingRate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
