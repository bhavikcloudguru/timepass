import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CapacityStatusReadonlyComponent } from './capacity-status-readonly.component';

describe('CapacityStatusReadonlyComponent', () => {
  let component: CapacityStatusReadonlyComponent;
  let fixture: ComponentFixture<CapacityStatusReadonlyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CapacityStatusReadonlyComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CapacityStatusReadonlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
