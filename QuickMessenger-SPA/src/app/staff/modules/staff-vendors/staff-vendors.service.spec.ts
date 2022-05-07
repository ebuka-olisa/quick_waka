/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { StaffVendorsService } from './staff-vendors.service';

describe('Service: StaffVendors', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StaffVendorsService]
    });
  });

  it('should ...', inject([StaffVendorsService], (service: StaffVendorsService) => {
    expect(service).toBeTruthy();
  }));
});
