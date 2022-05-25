import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultsExpandedComponent } from './results-expanded.component';

describe('ResultsExpandedComponent', () => {
  let component: ResultsExpandedComponent;
  let fixture: ComponentFixture<ResultsExpandedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ResultsExpandedComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultsExpandedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
