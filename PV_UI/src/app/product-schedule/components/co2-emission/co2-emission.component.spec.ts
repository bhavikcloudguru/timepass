import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Co2EmissionComponent } from './co2-emission.component';

describe('Co2EmissionComponent', () => {
  let component: Co2EmissionComponent;
  let fixture: ComponentFixture<Co2EmissionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [Co2EmissionComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Co2EmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
