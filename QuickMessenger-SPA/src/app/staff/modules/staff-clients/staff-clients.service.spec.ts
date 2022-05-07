/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { StaffClientsService } from './staff-clients.service';

describe('Service: StaffClients', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StaffClientsService]
    });
  });

  it('should ...', inject([StaffClientsService], (service: StaffClientsService) => {
    expect(service).toBeTruthy();
  }));
});
