import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpandViewComponent } from './expand-view.component';

describe('ExpandViewComponent', () => {
  let component: ExpandViewComponent;
  let fixture: ComponentFixture<ExpandViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpandViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpandViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
