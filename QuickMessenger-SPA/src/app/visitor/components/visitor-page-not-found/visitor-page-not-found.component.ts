import { Title } from '@angular/platform-browser';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-visitor-page-not-found',
    templateUrl: './visitor-page-not-found.component.html',
    styleUrls: ['./visitor-page-not-found.component.css']
})
export class VisitorPageNotFoundComponent implements OnInit {

    constructor(private title: Title) {

        // set page title
        this.title.setTitle('Page Not Found | Quick Waka');
    }

    ngOnInit() {
    }

}
