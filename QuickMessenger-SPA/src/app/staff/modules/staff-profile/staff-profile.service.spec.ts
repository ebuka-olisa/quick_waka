/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { StaffProfileService } from './staff-profile.service';

describe('Service: StaffProfile', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StaffProfileService]
    });
  });

  it('should ...', inject([StaffProfileService], (service: StaffProfileService) => {
    expect(service).toBeTruthy();
  }));
});
