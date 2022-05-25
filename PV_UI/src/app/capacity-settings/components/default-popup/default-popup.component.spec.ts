import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DefaultPopupComponent } from './default-popup.component';

describe('ConfirmationComponent', () => {
  let component: DefaultPopupComponent;
  let fixture: ComponentFixture<DefaultPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DefaultPopupComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DefaultPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
