import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AutocompleteFlagComponent } from './autocomplete-flag.component';

describe('AutocompleteFlagComponent', () => {
  let component: AutocompleteFlagComponent;
  let fixture: ComponentFixture<AutocompleteFlagComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AutocompleteFlagComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutocompleteFlagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
