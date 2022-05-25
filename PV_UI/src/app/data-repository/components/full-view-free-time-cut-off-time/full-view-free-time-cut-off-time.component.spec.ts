import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FullViewFreeTimeCutOffTimeComponent } from './full-view-free-time-cut-off-time.component';

describe('FullViewFreeTimeCutOffTimeComponent', () => {
  let component: FullViewFreeTimeCutOffTimeComponent;
  let fixture: ComponentFixture<FullViewFreeTimeCutOffTimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FullViewFreeTimeCutOffTimeComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FullViewFreeTimeCutOffTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
