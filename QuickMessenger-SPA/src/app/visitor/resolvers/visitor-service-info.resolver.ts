import { VisitorUserService } from './../services/visitor-user.service';
import { AuthService } from './../../services/auth.service';
import { catchError, map } from 'rxjs/operators';
import { VisitorServiceService } from '../services/visitor-service.service';
import { NotificationService } from 'src/app/services/notification.service';
import { ActivatedRouteSnapshot } from '@angular/router';
import { of, forkJoin } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class VisitorServiceInfoResolver {

    constructor(private serviceService: VisitorServiceService,
                private notify: NotificationService,
                private authService: AuthService,
                private userService: VisitorUserService) {}

    resolve(route: ActivatedRouteSnapshot) {
        if (this.authService.isUserloggedIn()) {
            return forkJoin([
                this.serviceService.getService(route.params.serviceId),
                this.userService.getAddresses()
            ]).pipe(
                map(result => {
                    return {
                        serviceInfo: result[0],
                        addresses: result[1]
                    };
                }),
                catchError((error) => {
                    this.notify.error('Problem loading information');
                    return of(null);
                })
            );
        } else {
            return forkJoin([
                this.serviceService.getService(route.params.serviceId)
            ]).pipe(
                map(result => {
                    return {
                        serviceInfo: result[0]
                    };
                }),
                catchError((error) => {
                    this.notify.error('Problem loading information');
                    return of(null);
                })
            );
        }
    }
}
