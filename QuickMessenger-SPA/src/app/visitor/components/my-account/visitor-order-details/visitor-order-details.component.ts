import { NotificationService } from './../../../../services/notification.service';
import { Component, OnInit } from '@angular/core';
import { Title, DomSanitizer } from '@angular/platform-browser';
import { CartServiceOrderDisplayViewModel } from 'src/app/models/cart';
import { ActivatedRoute, Router } from '@angular/router';
import { VisitorMyAccountComponent } from '../visitor-my-account/visitor-my-account.component';
import { VisitorUserService } from 'src/app/visitor/services/visitor-user.service';

@Component({
    selector: 'app-visitor-order-details',
    templateUrl: './visitor-order-details.component.html',
    styleUrls: ['./visitor-order-details.component.css']
})
export class VisitorOrderDetailsComponent implements OnInit {

    Order: CartServiceOrderDisplayViewModel;

    constructor(title: Title,
                private router: Router,
                private route: ActivatedRoute,
                private userService: VisitorUserService,
                private notify: NotificationService,
                private parentComponent: VisitorMyAccountComponent,
                private domSanitizer: DomSanitizer) {
        title.setTitle('Orders Details | Quick Waka');

        this.Order = new CartServiceOrderDisplayViewModel();
    }

    ngOnInit() {
        // get order by order-id
        this.parentComponent.showLoadingIndicator = true;
        this.route.params.subscribe(params => {
            const orderId = params['order-id'];
            if (orderId) {
                return this.userService.getOrder(orderId).subscribe(
                    // success
                    response => {
                        this.Order = response;
                        this.parentComponent.showLoadingIndicator = false;
                    },

                    // error
                    error => {
                        this.notify.error('Problem retrieving order information, please try reloading page');
                        this.parentComponent.showLoadingIndicator = false;
                        this.router.navigateByUrl('/my-account/orders');
                    }
                );
            } else {
                this.notify.error('Problem retrieving order information, please try reloading page');
                this.router.navigateByUrl('/my-account/orders');
            }
        });
    }

    allowImageURL(url: string) {
        return this.domSanitizer.bypassSecurityTrustUrl(url);
    }

}
