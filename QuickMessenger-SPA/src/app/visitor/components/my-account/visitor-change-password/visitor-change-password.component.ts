import { VisitorUserService } from 'src/app/visitor/services/visitor-user.service';
import { ValidationErrorService } from './../../../../services/validation-error.service';
import { NotificationService } from './../../../../services/notification.service';
import { AuthService } from './../../../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ManageUserPassword } from 'src/app/models/user';
import { MyValidationErrors } from 'src/app/models/my-validation-errors';

@Component({
  selector: 'app-visitor-change-password',
  templateUrl: './visitor-change-password.component.html',
  styleUrls: ['./visitor-change-password.component.css']
})
export class VisitorChangePasswordComponent implements OnInit {

    User: ManageUserPassword;

    processing = false;
    fieldErrors: any = {};
    validationErrors = [];

    constructor(title: Title,
                private authService: AuthService,
                private notify: NotificationService,
                private validationErrorService: ValidationErrorService,
                private userService: VisitorUserService) {
        title.setTitle('Change Password | Quick Waka');

        this.User = new ManageUserPassword();
    }

    ngOnInit() {
        const currentUser = this.authService.getUser();
        if (currentUser) {
            this.User.id = Number.parseInt(currentUser.id, 10);
            this.User.userName = currentUser.email;
        }
    }


    // Save
    save() {
        this.processing = true;
        this.fieldErrors = {};

        let errorFound = false;
        if (!this.User.currentPassword || this.User.currentPassword.trim() === '') {
            this.fieldErrors.CurrentPassword = 'Enter your current password';
            errorFound = true;
        }
        if (!this.User.newPassword || this.User.newPassword.trim() === '') {
            this.fieldErrors.NewPassword = 'Enter your new password';
            errorFound = true;
        }
        if (!this.User.conFirmNewPassWord || this.User.conFirmNewPassWord.trim() === '') {
            this.fieldErrors.ConFirmNewPassWord = 'Re-enter your new password';
            errorFound = true;
        }

        // if changes were made to staff information then update staff
        if (!errorFound) {
            this.userService.changePassword(this.User)
            .subscribe(

                // success
                () => {
                    // show success information
                    this.notify.success('Password was changed successfully!');

                    // stop loading icon
                    this.processing = false;

                    // clear UI
                    this.User.currentPassword = '';
                    this.User.newPassword = '';
                    this.User.conFirmNewPassWord = '';
                },

                // error
                error => {
                    const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error);
                    this.fieldErrors = allErrors.fieldErrors;
                    if (this.fieldErrors.PasswordMismatch) {
                        this.fieldErrors.CurrentPassword = this.fieldErrors.PasswordMismatch;
                    }
                    if (this.fieldErrors.newPassword) {
                        this.fieldErrors.NewPassword = this.fieldErrors.newPassword;
                    }
                    // PasswordMismatch
                    this.processing = false;
                }
            );
        } else {
            this.processing = false;
        }
    }

}
