/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { VisitorProductService } from './visitor-product.service';

describe('Service: VisitorProduct', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VisitorProductService]
    });
  });

  it('should ...', inject([VisitorProductService], (service: VisitorProductService) => {
    expect(service).toBeTruthy();
  }));
});
