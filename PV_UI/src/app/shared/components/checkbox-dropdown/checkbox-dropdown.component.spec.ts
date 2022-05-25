import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckboxDropdownComponent } from './checkbox-dropdown.component';

describe('CheckboxDropdownComponent', () => {
  let component: CheckboxDropdownComponent;
  let fixture: ComponentFixture<CheckboxDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CheckboxDropdownComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckboxDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
