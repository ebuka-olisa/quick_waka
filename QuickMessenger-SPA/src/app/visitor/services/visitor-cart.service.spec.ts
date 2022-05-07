/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { VisitorCartService } from './visitor-cart.service';

describe('Service: VisitorCart', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VisitorCartService]
    });
  });

  it('should ...', inject([VisitorCartService], (service: VisitorCartService) => {
    expect(service).toBeTruthy();
  }));
});
