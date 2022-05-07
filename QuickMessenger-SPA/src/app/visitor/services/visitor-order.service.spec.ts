/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { VisitorOrderService } from './visitor-order.service';

describe('Service: VisitorOrder', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VisitorOrderService]
    });
  });

  it('should ...', inject([VisitorOrderService], (service: VisitorOrderService) => {
    expect(service).toBeTruthy();
  }));
});
