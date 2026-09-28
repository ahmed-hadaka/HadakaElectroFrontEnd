import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InternalNavBar } from './internal-nav-bar';

describe('CustomerNavBar', () => {
  let component: InternalNavBar;
  let fixture: ComponentFixture<InternalNavBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InternalNavBar],
    }).compileComponents();

    fixture = TestBed.createComponent(InternalNavBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
