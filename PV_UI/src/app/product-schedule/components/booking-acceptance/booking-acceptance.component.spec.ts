import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingAcceptanceComponent } from './booking-acceptance.component';

describe('BookingAcceptanceComponent', () => {
  let component: BookingAcceptanceComponent;
  let fixture: ComponentFixture<BookingAcceptanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BookingAcceptanceComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookingAcceptanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
