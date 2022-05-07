import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-visitor-terms-and-conditions',
  templateUrl: './visitor-terms-and-conditions.component.html',
  styleUrls: ['./visitor-terms-and-conditions.component.scss']
})
export class VisitorTermsAndConditionsComponent implements OnInit {

    constructor(private title: Title) {
        // set page title
        this.title.setTitle('Terms and Conditions | Quick Waka');
    }

    ngOnInit() {
    }

}
