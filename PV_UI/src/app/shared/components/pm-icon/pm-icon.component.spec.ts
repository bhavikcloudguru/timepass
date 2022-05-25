import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PmIconComponent } from './pm-icon.component';

describe('PmIconComponent', () => {
  let component: PmIconComponent;
  let fixture: ComponentFixture<PmIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PmIconComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PmIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
