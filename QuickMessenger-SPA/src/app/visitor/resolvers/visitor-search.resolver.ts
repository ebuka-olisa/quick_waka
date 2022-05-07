import { VisitorServiceService } from './../services/visitor-service.service';
import { VisitorVendorService } from './../services/visitor-vendor.service';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { VisitorProductService } from '../services/visitor-product.service';
import { NotificationService } from 'src/app/services/notification.service';
import { catchError, map } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class VisitorSearchResolver implements Resolve<any> {

    constructor(private productService: VisitorProductService,
                private vendorService: VisitorVendorService,
                private serviceService: VisitorServiceService,
                private notify: NotificationService) {}

    resolve(route: ActivatedRouteSnapshot) {
        if (route.params.section) {
            if (route.params.section === 'products') {
                return forkJoin([
                    this.productService.searchProducts(route.queryParams, 1, 48),
                    this.productService.getSearchTopLevelCategories(route.queryParams.searchTerm),
                    this.serviceService.getDefaultGenericService()
                ]).pipe(
                    map(result => {
                        return {
                            section: route.params.section,
                            result: result [0],
                            topCategories: result[1],
                            defaultGeneric: result[2]
                        };
                    }),
                    catchError((error) => {
                        this.notify.error('Problem loading information');
                        return of ({
                            section: route.params.section,
                            result: null,
                            minMaxPrice : {minPrice: 0, maxPrice: 0}
                        });
                    })
                );
            } else if (route.params.section === 'vendors') {
                return this.vendorService.searchVendors(route.queryParams, 1, 48).pipe(
                    map(result => {
                        return {
                            section: route.params.section,
                            result
                        };
                    }),
                    catchError((error) => {
                        this.notify.error('Problem loading information');
                        return of ({
                            section: route.params.section,
                            result: null
                        });
                    })
                );
            }
        }
    }
}

