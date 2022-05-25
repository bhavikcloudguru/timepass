import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericFilterComponentWithGroupingComponent } from './generic-filter-component-with-grouping.component';

describe('GenericFilterComponentWithGroupingComponent', () => {
  let component: GenericFilterComponentWithGroupingComponent;
  let fixture: ComponentFixture<GenericFilterComponentWithGroupingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GenericFilterComponentWithGroupingComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(
      GenericFilterComponentWithGroupingComponent
    );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
