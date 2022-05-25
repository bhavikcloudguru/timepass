import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationPanelHeaderComponent } from './notification-panel-header.component';

describe('NotificationPanelHeaderComponent', () => {
  let component: NotificationPanelHeaderComponent;
  let fixture: ComponentFixture<NotificationPanelHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationPanelHeaderComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationPanelHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
