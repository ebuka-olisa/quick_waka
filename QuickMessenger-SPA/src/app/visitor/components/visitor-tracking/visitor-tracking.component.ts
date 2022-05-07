import { VisitorOrderService } from './../../services/visitor-order.service';
import { Component, OnInit } from '@angular/core';
import { Title, DomSanitizer } from '@angular/platform-browser';
import { CartDisplayViewModel, CartServiceOrderDisplayViewModel } from 'src/app/models/cart';

@Component({
    selector: 'app-visitor-tracking',
    templateUrl: './visitor-tracking.component.html',
    styleUrls: ['./visitor-tracking.component.css']
})
export class VisitorTrackingComponent implements OnInit {

    TrackingDone = false;
    TrackingSuccessful = false;
    TrackingId: string;

    Cart: CartDisplayViewModel;

    showLoadingIndicator = false;

    constructor(title: Title,
                private orderService: VisitorOrderService,
                private domSanitizer: DomSanitizer) {
        title.setTitle('Track your order or cart | Quick Waka');
    }

    ngOnInit() {
    }

    track() {
        if (this.TrackingId && this.TrackingId.trim() !== '') {
            this.Cart = new CartDisplayViewModel();
            this.Cart.orders = [];
            this.TrackingDone = false;
            this.TrackingSuccessful = false;
            this.showLoadingIndicator = true;
            return this.orderService.track(this.TrackingId).subscribe(
                // success
                response => {
                    this.TrackingDone = true;
                    this.TrackingSuccessful = true;
                    this.showLoadingIndicator = false;
                    if (response.type) {
                        this.Cart.orders.push(response);
                    } else {
                        this.Cart = response;
                    }
                    // this.Order = response;
                    // this.parentComponent.showLoadingIndicator = false;
                },

                // error
                error => {
                    this.TrackingDone = true;
                    this.TrackingSuccessful = false;
                    this.showLoadingIndicator = false;
                    // this.notify.error('Problem retrieving order information, please try reloading page');
                    // this.parentComponent.showLoadingIndicator = false;
                    // this.router.navigateByUrl('/my-account/orders');
                }
            );
        }
    }

    allowImageURL(url: string) {
        return this.domSanitizer.bypassSecurityTrustUrl(url);
    }

}
