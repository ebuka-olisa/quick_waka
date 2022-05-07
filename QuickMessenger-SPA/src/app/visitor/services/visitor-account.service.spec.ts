/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { VisitorAccountService } from './visitor-account.service';

describe('Service: VisitorAccount', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VisitorAccountService]
    });
  });

  it('should ...', inject([VisitorAccountService], (service: VisitorAccountService) => {
    expect(service).toBeTruthy();
  }));
});
