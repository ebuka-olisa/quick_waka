/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { VisitorVendorService } from './visitor-vendor.service';

describe('Service: VisitorVendor', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VisitorVendorService]
    });
  });

  it('should ...', inject([VisitorVendorService], (service: VisitorVendorService) => {
    expect(service).toBeTruthy();
  }));
});
