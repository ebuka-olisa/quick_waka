import { VisitorServiceService } from './../services/visitor-service.service';
import { VisitorVendorService } from './../services/visitor-vendor.service';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { NotificationService } from 'src/app/services/notification.service';
import { catchError, map } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';
import { ServiceProductListing } from 'src/app/models/service';
import { Injectable } from '@angular/core';

@Injectable()
export class VisitorVendorProductListResolver implements Resolve<any> {

    constructor(private vendorService: VisitorVendorService,
                private serviceService: VisitorServiceService,
                private notify: NotificationService) {}

    resolve(route: ActivatedRouteSnapshot) {
        return forkJoin([
            this.vendorService.getVendor(route.params.id),
            this.vendorService.getProducts(route.params.id, route.queryParams, 1, 48),
            this.vendorService.getTopLevelCategories(route.params.id),
            this.serviceService.getDefaultGenericService()
        ]).pipe(
            map(result => {
                return {
                    vendorInfo: result[0],
                    productInfo: result[1],
                    topCategories: result[2],
                    defaultGeneric: result[3]
                };
            }),
            catchError((error) => {
                this.notify.error('Problem loading information');
                return of(new ServiceProductListing());
            })
        );
        // }
    }
}
