import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvalidRolesComponent } from './invalid-roles.component';

describe('InvalidRolesComponent', () => {
  let component: InvalidRolesComponent;
  let fixture: ComponentFixture<InvalidRolesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [InvalidRolesComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvalidRolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
