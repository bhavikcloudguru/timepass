import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FreeTimeCutOffTimePopupComponent } from './free-time-cut-off-time-popup.component';

describe('FreeTimeCutOffTimePopupComponent', () => {
  let component: FreeTimeCutOffTimePopupComponent;
  let fixture: ComponentFixture<FreeTimeCutOffTimePopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FreeTimeCutOffTimePopupComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FreeTimeCutOffTimePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
