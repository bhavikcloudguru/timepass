import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FreeTimeCutOffTimeComponent } from './free-time-cut-off-time.component';

describe('FreeTimeCutOffTimeComponent', () => {
  let component: FreeTimeCutOffTimeComponent;
  let fixture: ComponentFixture<FreeTimeCutOffTimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FreeTimeCutOffTimeComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FreeTimeCutOffTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
