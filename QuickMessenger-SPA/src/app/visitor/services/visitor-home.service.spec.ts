/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { VisitorHomeService } from './visitor-home.service';

describe('Service: VisitorHome', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VisitorHomeService]
    });
  });

  it('should ...', inject([VisitorHomeService], (service: VisitorHomeService) => {
    expect(service).toBeTruthy();
  }));
});
