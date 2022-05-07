/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { VisitorServiceService } from './visitor-service.service';

describe('Service: VisitorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VisitorServiceService]
    });
  });

  it('should ...', inject([VisitorServiceService], (service: VisitorServiceService) => {
    expect(service).toBeTruthy();
  }));
});
