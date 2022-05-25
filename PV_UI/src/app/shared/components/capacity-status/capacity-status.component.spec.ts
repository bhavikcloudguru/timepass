import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CapacityStatusComponent } from './capacity-status.component';

describe('CapacityStatusComponent', () => {
  let component: CapacityStatusComponent;
  let fixture: ComponentFixture<CapacityStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CapacityStatusComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CapacityStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
