import { Component, OnInit } from '@angular/core';
import { ManageUserPassword } from 'src/app/models/user';
import { StaffProfileLayoutComponent } from '../staff-profile-layout/staff-profile-layout.component';
import { StaffProfileService } from '../staff-profile.service';
import { ValidationErrorService } from 'src/app/services/validation-error.service';
import { MyValidationErrors } from 'src/app/models/my-validation-errors';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
    selector: 'app-staff-profile-change-password',
    templateUrl: './staff-profile-change-password.component.html',
    styleUrls: ['./staff-profile-change-password.component.css']
})
export class StaffProfileChangePasswordComponent implements OnInit {

    UserPassword: ManageUserPassword;

    fieldErrors: any = {};
    processing = false;

    constructor(private parentComponent: StaffProfileLayoutComponent,
                private staffProfileService: StaffProfileService,
                private validationErrorService: ValidationErrorService,
                private notify: NotificationService) {

        this.UserPassword = new ManageUserPassword();

    }

    ngOnInit() {
        if (this.parentComponent.User) {
            this.UserPassword.id = this.parentComponent.User.id;
            this.UserPassword.userName = this.parentComponent.User.email;
        }
    }


    // Save
    save() {
        this.processing = true;
        this.fieldErrors = {};

        // if changes were made to staff information then update staff
        if (this.UserPassword.currentPassword.trim() !== '' && this.UserPassword.newPassword.trim() !== ''
        && this.UserPassword.conFirmNewPassWord.trim() !== '') {
            this.staffProfileService.changePassword(this.UserPassword)
            .subscribe(

                // success
                () => {
                    // show success information
                    this.notify.success('Password was changed successfully!');

                    // stop loading icon
                    this.processing = false;

                    // clear UI
                    this.UserPassword.currentPassword = '';
                    this.UserPassword.newPassword = '';
                    this.UserPassword.conFirmNewPassWord = '';
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
        }
    }

}
