/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { StaffServicesService } from './staff-services.service';

describe('Service: StaffServices', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StaffServicesService]
    });
  });

  it('should ...', inject([StaffServicesService], (service: StaffServicesService) => {
    expect(service).toBeTruthy();
  }));
});
