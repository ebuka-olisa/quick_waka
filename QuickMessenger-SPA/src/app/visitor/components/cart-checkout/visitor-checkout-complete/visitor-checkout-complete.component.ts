import { ActivatedRoute } from '@angular/router';
import { VisitorCartService } from './../../../services/visitor-cart.service';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import * as $ from 'jquery';

@Component({
  selector: 'app-visitor-checkout-complete',
  templateUrl: './visitor-checkout-complete.component.html',
  styleUrls: ['./visitor-checkout-complete.component.scss']
})
export class VisitorCheckoutCompleteComponent implements OnInit {

    CartId: string;

    constructor(title: Title,
                private route: ActivatedRoute,
                private cartService: VisitorCartService) {
        title.setTitle('Checkout Successful | QuickWaka');
        $('iframe[name ="checkout"]').css({position: 'fixed'});
    }

    ngOnInit() {
        this.route.params.subscribe (params => {
            this.CartId = params.cartId;
        });

        // Clear cart
        this.cartService.emptyCart(false);
    }

}
