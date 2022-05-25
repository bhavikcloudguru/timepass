import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationPanelBodyComponent } from './notification-panel-body.component';

describe('NotificationPanelBodyComponent', () => {
  let component: NotificationPanelBodyComponent;
  let fixture: ComponentFixture<NotificationPanelBodyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationPanelBodyComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationPanelBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
