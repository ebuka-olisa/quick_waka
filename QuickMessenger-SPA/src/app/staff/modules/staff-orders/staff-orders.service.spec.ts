/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { StaffOrdersService } from './staff-orders.service';

describe('Service: StaffOrders', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StaffOrdersService]
    });
  });

  it('should ...', inject([StaffOrdersService], (service: StaffOrdersService) => {
    expect(service).toBeTruthy();
  }));
});
