import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SlideToggleBoxComponent } from './slide-toggle-box.component';

describe('SlideToggleBoxComponent', () => {
  let component: SlideToggleBoxComponent;
  let fixture: ComponentFixture<SlideToggleBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SlideToggleBoxComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SlideToggleBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
