/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { VisitorUserService } from './visitor-user.service';

describe('Service: VisitorUser', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VisitorUserService]
    });
  });

  it('should ...', inject([VisitorUserService], (service: VisitorUserService) => {
    expect(service).toBeTruthy();
  }));
});
