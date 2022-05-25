import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckboxAutocompleteComponent } from './checkbox-autocomplete.component';

describe('CheckboxDropdownComponent', () => {
  let component: CheckboxAutocompleteComponent;
  let fixture: ComponentFixture<CheckboxAutocompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CheckboxAutocompleteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckboxAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
