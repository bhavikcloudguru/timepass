import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PricingSurchargesComponent } from './pricing-surcharges.component';

describe('PricingSurchargesComponent', () => {
  let component: PricingSurchargesComponent;
  let fixture: ComponentFixture<PricingSurchargesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PricingSurchargesComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PricingSurchargesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
