import { TestBed } from '@angular/core/testing';

import { HttpConfigInterceptor } from './httpconfig.interceptor';

describe('Httpconfig.InterceptorService', () => {
  let service: HttpConfigInterceptor;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HttpConfigInterceptor);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
