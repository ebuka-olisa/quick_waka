import { HomePageItems } from './../../models/page-extras';
import { VisitorHomeService } from './../services/visitor-home.service';
import { Resolve } from '@angular/router';
import { NotificationService } from 'src/app/services/notification.service';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';

@Injectable()
export class VisitorHomePageResolver implements Resolve<any> {

    constructor(private homeService: VisitorHomeService,
                private notify: NotificationService) {}

    resolve() {
        return this.homeService.getHomePageItems()
        .pipe(
            catchError((error) => {
                this.notify.error('Problem loading information');
                return of(new HomePageItems());
            })
        );
    }
}
