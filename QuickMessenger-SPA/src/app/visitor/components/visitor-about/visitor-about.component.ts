import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'app-visitor-about',
    templateUrl: './visitor-about.component.html',
    styleUrls: ['./visitor-about.component.css']
})
export class VisitorAboutComponent implements OnInit {

    constructor(private title: Title) {
        // set page title
        this.title.setTitle('About Us | Quick Waka');
    }

    ngOnInit() {
    }

}
