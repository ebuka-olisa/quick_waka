import { StaffViewModel } from 'src/app/models/staff';
import { AuthService } from './../../../../services/auth.service';
import { StaffProfileService } from './../staff-profile.service';
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { NotificationService } from 'src/app/services/notification.service';

@Injectable()
export class StaffProfileResolver implements Resolve<any> {

    constructor(private staffProfileService: StaffProfileService,
                private authService: AuthService,
                private notify: NotificationService) { }

    resolve() {

        // get currently logged in user info
        const loggedInStaff = this.authService.getUser();

        // route: ActivatedRouteSnapshot
        // route.params.[key]

        return this.staffProfileService.getStaffProfile(loggedInStaff)
        .pipe(
            catchError((error) => {
                this.notify.error('Problem loading profile information');
                return of(new StaffViewModel());
            })
        );
    }

}
