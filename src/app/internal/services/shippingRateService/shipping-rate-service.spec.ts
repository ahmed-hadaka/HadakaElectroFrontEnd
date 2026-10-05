import { TestBed } from '@angular/core/testing';
import { ShippingRateService } from './shipping-rate-service';

describe('ShippingRateService', () => {
  let service: ShippingRateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShippingRateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
