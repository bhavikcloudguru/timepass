import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TranshippmentFiltersComponent } from './transhippment-filters.component';

describe('TranshippmentFiltersComponent', () => {
  let component: TranshippmentFiltersComponent;
  let fixture: ComponentFixture<TranshippmentFiltersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TranshippmentFiltersComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TranshippmentFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
