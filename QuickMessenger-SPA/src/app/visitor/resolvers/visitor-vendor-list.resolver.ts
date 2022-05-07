import { NotificationService } from 'src/app/services/notification.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ServiceProductListing } from 'src/app/models/service';
import { VisitorVendorService } from '../services/visitor-vendor.service';
import { Injectable } from '@angular/core';

@Injectable()
export class VisitorVendorListResolver {

    constructor(private vendorService: VisitorVendorService,
                private notify: NotificationService) {}

    resolve() {
        return this.vendorService.getVendors(1, 50)
            .pipe(
                catchError((error) => {
                    this.notify.error('Problem loading information');
                    return of(new ServiceProductListing());
                })
            );
    }
}
