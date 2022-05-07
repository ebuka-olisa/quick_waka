import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { VisitorAccountService } from 'src/app/visitor/services/visitor-account.service';
import { ValidationErrorService } from 'src/app/services/validation-error.service';
import { ForgotUserPassword } from 'src/app/models/user';
import { MyValidationErrors } from 'src/app/models/my-validation-errors';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-visitor-forgot-password',
    templateUrl: './visitor-forgot-password.component.html',
    styleUrls: ['./visitor-forgot-password.component.css']
})
export class VisitorForgotPasswordComponent implements OnInit {

    User: ForgotUserPassword;

    queryParams = {};

    processing = false;
    completed = false;
    validationErrors: any[] = [];
    fieldErrors: any = {};

    constructor(private title: Title,
                private accountService: VisitorAccountService,
                private validationErrorService: ValidationErrorService,
                private actRoute: ActivatedRoute) {
        // set page title
        this.title.setTitle('Forgot Password | Quick Waka');

        this.User = new ForgotUserPassword();
    }

    ngOnInit() {
        // get query params if any
        this.actRoute.queryParams.subscribe(params => {
            for (const key in params) {
                if (params.hasOwnProperty(key)) {
                    this.queryParams[key] = params[key];
                }
            }
        });
    }


    reset() {
        this.processing = true;
        this.validationErrors = [];
        this.fieldErrors = {};
        let error = false;

        if (!this.User.username || this.User.username.trim() === '') {
            this.fieldErrors.Username = 'Enter your email address';
            error = true;
        }

        if (error) {
            this.processing = false;
        } else {
            this.accountService.forgotPassword(this.User)
            .subscribe(

                // success
                () => {
                    // this.router.navigate([this.returnUrl]);
                    this.completed = true;
                    this.processing = false;
                },

                // error
                errors => {
                    const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(errors);
                    this.validationErrors = allErrors.validationErrors;
                    this.fieldErrors = allErrors.fieldErrors;
                    if (this.fieldErrors.Username === undefined && this.fieldErrors.Password === undefined) {
                        this.validationErrors.push('Invalid account details');
                    }
                    if (this.fieldErrors.error) {
                        this.fieldErrors.Username = this.fieldErrors.error;
                    }
                    this.processing = false;
                }
            );
        }
    }
}
