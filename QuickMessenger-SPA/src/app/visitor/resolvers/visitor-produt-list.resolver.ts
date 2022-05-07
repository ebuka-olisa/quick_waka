import { Resolve, ActivatedRouteSnapshot, UrlSegment, RouterStateSnapshot } from '@angular/router';
import { NotificationService } from 'src/app/services/notification.service';
import { VisitorProductService } from '../services/visitor-product.service';
import { catchError, map } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';
import { ServiceProductListing } from 'src/app/models/service';
import { Injectable } from '@angular/core';

@Injectable()
export class VisitorProductListResolver implements Resolve<any> {

    constructor(private productService: VisitorProductService,
                private notify: NotificationService) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const queryIndex = state.url.indexOf('?');
        const url = queryIndex === -1 ? state.url : state.url.substring(0, queryIndex);
        const serviceNameId = url.substr(url.lastIndexOf('/') + 1);

        if (route.queryParams.category) {
            return this.productService.getProducts(serviceNameId, route.queryParams, 1, 48)
            .pipe(
                catchError((error) => {
                    this.notify.error('Problem loading information');
                    return of(new ServiceProductListing());
                })
            );
        } else {
            return forkJoin([
                this.productService.getProducts(serviceNameId, route.queryParams, 1, 48),
                this.productService.getTopLevelCategories(serviceNameId)
            ]).pipe(
                map(result => {
                    return {
                        serviceInfo: result[0],
                        topCategories: result[1]
                    };
                }),
                catchError((error) => {
                    this.notify.error('Problem loading information');
                    return of(new ServiceProductListing());
                })
            );
        }
    }
}
