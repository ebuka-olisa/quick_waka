/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { StaffLoginService } from './staff-login.service';

describe('Service: AdminLogin', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StaffLoginService]
    });
  });

  it('should ...', inject([StaffLoginService], (service: StaffLoginService) => {
    expect(service).toBeTruthy();
  }));
});
