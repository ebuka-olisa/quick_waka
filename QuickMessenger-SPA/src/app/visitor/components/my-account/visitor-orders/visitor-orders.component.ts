import { NotificationService } from './../../../../services/notification.service';
import { VisitorUserService } from './../../../services/visitor-user.service';
import { Component, OnInit } from '@angular/core';
import { Title, DomSanitizer } from '@angular/platform-browser';
import { VisitorMyAccountComponent } from '../visitor-my-account/visitor-my-account.component';
import { CartDisplayViewModel } from 'src/app/models/cart';

@Component({
    selector: 'app-visitor-orders',
    templateUrl: './visitor-orders.component.html',
    styleUrls: ['./visitor-orders.component.css']
})
export class VisitorOrdersComponent implements OnInit {

    Carts: CartDisplayViewModel[];

    constructor(title: Title,
                private parentComponent: VisitorMyAccountComponent,
                private userService: VisitorUserService,
                private notify: NotificationService,
                private domSanitizer: DomSanitizer) {

        title.setTitle('My Orders | Quick Waka');
    }

    ngOnInit() {
        // load user's orders
        this.parentComponent.showLoadingIndicator = true;
        return this.userService.getCarts().subscribe(
            // success
            response => {
                this.Carts = response;
                this.parentComponent.showLoadingIndicator = false;
            },

            // error
            error => {
                this.notify.error('Problem retrieving order information, please try reloading page');
                this.parentComponent.showLoadingIndicator = false;
            }
        );
    }

    allowImageURL(url: string) {
        return this.domSanitizer.bypassSecurityTrustUrl(url);
    }

}
