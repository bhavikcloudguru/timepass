import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductViewerDashboardComponent } from './product-viewer-dashboard.component';

describe('ProductViewerDashboardComponent', () => {
  let component: ProductViewerDashboardComponent;
  let fixture: ComponentFixture<ProductViewerDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductViewerDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductViewerDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
