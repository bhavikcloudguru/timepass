import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotesPopupComponent } from './notes-popup.component';

describe('NotesPopupComponent', () => {
  let component: NotesPopupComponent;
  let fixture: ComponentFixture<NotesPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NotesPopupComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotesPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
