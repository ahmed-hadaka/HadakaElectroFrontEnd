import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListBrands } from './list-brands';

describe('ListBrands', () => {
  let component: ListBrands;
  let fixture: ComponentFixture<ListBrands>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListBrands]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListBrands);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
