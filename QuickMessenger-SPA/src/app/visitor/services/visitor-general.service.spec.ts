/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { VisitorGeneralService } from './visitor-general.service';

describe('Service: VisitorGeneral', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VisitorGeneralService]
    });
  });

  it('should ...', inject([VisitorGeneralService], (service: VisitorGeneralService) => {
    expect(service).toBeTruthy();
  }));
});
