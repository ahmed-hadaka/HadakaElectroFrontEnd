import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrandDetails } from './brand-details';

describe('BrandDetails', () => {
  let component: BrandDetails;
  let fixture: ComponentFixture<BrandDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrandDetails]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BrandDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
