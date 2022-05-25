import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewDlComponent } from './add-new-dl.component';

describe('AddNewDlComponent', () => {
  let component: AddNewDlComponent;
  let fixture: ComponentFixture<AddNewDlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddNewDlComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNewDlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
