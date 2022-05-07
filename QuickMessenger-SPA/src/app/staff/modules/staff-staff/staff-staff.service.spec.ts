/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { StaffStaffService } from './staff-staff.service';

describe('Service: StaffStaff', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StaffStaffService]
    });
  });

  it('should ...', inject([StaffStaffService], (service: StaffStaffService) => {
    expect(service).toBeTruthy();
  }));
});
