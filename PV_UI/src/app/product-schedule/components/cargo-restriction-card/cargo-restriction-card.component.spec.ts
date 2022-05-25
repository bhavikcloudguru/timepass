import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CargoRestrictionCardComponent } from './cargo-restriction-card.component';

describe('CargoRestrictionCardComponent', () => {
  let component: CargoRestrictionCardComponent;
  let fixture: ComponentFixture<CargoRestrictionCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CargoRestrictionCardComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CargoRestrictionCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
