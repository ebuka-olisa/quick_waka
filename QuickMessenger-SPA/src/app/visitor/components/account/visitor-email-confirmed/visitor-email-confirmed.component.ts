import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { VisitorAccountService } from 'src/app/visitor/services/visitor-account.service';
import { UserConfirmEmail } from 'src/app/models/user';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-visitor-email-confirmed',
    templateUrl: './visitor-email-confirmed.component.html',
    styleUrls: ['./visitor-email-confirmed.component.css']
})
export class VisitorEmailConfirmedComponent implements OnInit {

    User: UserConfirmEmail;

    confirmed = true;
    processing = true;

    constructor(private title: Title,
                private route: ActivatedRoute,
                private accountService: VisitorAccountService) {
        this.title.setTitle('Email Confirmation | Quick Waka');
        this.User = new UserConfirmEmail();
    }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.User.email = params.email;
            this.User.token = params.token;

            if (this.User.email && this.User.email !== '' && this.User.token && this.User.token !== '') {
                // confirm email
                this.confirmEmail();
            } else {
                this.confirmed = false;
                this.processing = false;
            }
        });
    }

    confirmEmail() {
        this.accountService.confirmEmail(this.User)
            .subscribe(

                // success
                () => {
                    this.confirmed = true;
                    this.processing = false;
                },

                // error
                errors => {
                    this.confirmed = false;
                    this.processing = false;
                }
            );
    }

}
