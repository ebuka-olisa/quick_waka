import { UserResetPassword } from './../../../../models/user';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { VisitorAccountService } from 'src/app/visitor/services/visitor-account.service';
import { ValidationErrorService } from 'src/app/services/validation-error.service';
import { MyValidationErrors } from 'src/app/models/my-validation-errors';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-visitor-reset-password',
    templateUrl: './visitor-reset-password.component.html',
    styleUrls: ['./visitor-reset-password.component.css']
})
export class VisitorResetPasswordComponent implements OnInit {

    User: UserResetPassword;

    processing = false;
    completed = false;
    validationErrors: any[] = [];
    fieldErrors: any = {};

    constructor(private title: Title,
                private route: ActivatedRoute,
                private accountService: VisitorAccountService,
                private validationErrorService: ValidationErrorService) {
        // set page title
        this.title.setTitle('Reset Password | Quick Waka');

        this.User = new UserResetPassword();
    }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.User.username = params.email;
            this.User.token = params.token;
        });
    }


    reset() {
        this.processing = true;
        this.validationErrors = [];
        this.fieldErrors = {};
        let error = false;

        if (!this.User.password || this.User.password.trim() === '') {
            this.fieldErrors.Password = 'Enter your new password';
            error = true;
        }
        if (!this.User.confirmPassword || this.User.confirmPassword.trim() === '') {
            this.fieldErrors.ConfirmPassword = 'Confirm your new password';
            error = true;
        }

        if (error) {
            this.processing = false;
        } else {
            this.accountService.resetPassword(this.User)
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
                    if (this.fieldErrors.error) {
                        this.fieldErrors.GeneralError = this.fieldErrors.error;
                    }
                    this.processing = false;
                }
            );
        }
    }

}
