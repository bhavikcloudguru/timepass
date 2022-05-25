import { TestBed } from '@angular/core/testing';

import { ProductViewerDashboardService } from './product-viewer-dashboard.service';

describe('ProductViewerDashboardService', () => {
  let service: ProductViewerDashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductViewerDashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
