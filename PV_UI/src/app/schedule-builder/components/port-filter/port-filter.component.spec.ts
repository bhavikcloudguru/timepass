import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PortFilterComponent } from './port-filter.component';

describe('PortFilterComponent', () => {
  let component: PortFilterComponent;
  let fixture: ComponentFixture<PortFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PortFilterComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PortFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
