import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-visitor-checkout-failed',
  templateUrl: './visitor-checkout-failed.component.html',
  styleUrls: ['./visitor-checkout-failed.component.scss']
})
export class VisitorCheckoutFailedComponent implements OnInit {

    constructor(title: Title) {
        title.setTitle('Checkout Failed | QuickWaka');
    }

    ngOnInit() {
    }

}
