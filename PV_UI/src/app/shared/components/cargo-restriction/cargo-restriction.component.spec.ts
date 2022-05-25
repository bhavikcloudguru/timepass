import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CargoRestrictionComponent } from './cargo-restriction.component';

describe('CargoRestrictionComponent', () => {
  let component: CargoRestrictionComponent;
  let fixture: ComponentFixture<CargoRestrictionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CargoRestrictionComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CargoRestrictionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
