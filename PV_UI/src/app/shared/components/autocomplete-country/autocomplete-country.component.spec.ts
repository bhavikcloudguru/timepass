import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AutocompleteCountryComponent } from './autocomplete-country.component';

describe('AutocompleteCountryComponent', () => {
  let component: AutocompleteCountryComponent;
  let fixture: ComponentFixture<AutocompleteCountryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AutocompleteCountryComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutocompleteCountryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
