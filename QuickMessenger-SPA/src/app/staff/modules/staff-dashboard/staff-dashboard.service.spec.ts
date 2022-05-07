/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { StaffDashboardService } from './staff-dashboard.service';

describe('Service: StaffDashboard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StaffDashboardService]
    });
  });

  it('should ...', inject([StaffDashboardService], (service: StaffDashboardService) => {
    expect(service).toBeTruthy();
  }));
});
