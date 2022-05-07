/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { StaffProductsService } from './staff-products.service';

describe('Service: StaffProducts', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StaffProductsService]
    });
  });

  it('should ...', inject([StaffProductsService], (service: StaffProductsService) => {
    expect(service).toBeTruthy();
  }));
});
