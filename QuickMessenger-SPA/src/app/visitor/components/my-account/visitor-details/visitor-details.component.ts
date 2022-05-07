import { ValidationErrorService } from './../../../../services/validation-error.service';
import { NotificationService } from './../../../../services/notification.service';
import { VisitorUserService } from 'src/app/visitor/services/visitor-user.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { EditUser } from 'src/app/models/user';
import { VisitorMyAccountComponent } from '../visitor-my-account/visitor-my-account.component';
import { Ng2TelInput } from 'ng2-tel-input';
import { MyValidationErrors } from 'src/app/models/my-validation-errors';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-visitor-details',
    templateUrl: './visitor-details.component.html',
    styleUrls: ['./visitor-details.component.css']
})
export class VisitorDetailsComponent implements OnInit {

    @ViewChild(Ng2TelInput, {static: false}) telInputDirectiveRef: Ng2TelInput;

    User: EditUser;
    UserId: number;
    OriginalUser: string;
    TempPhone: string;

    processing = false;
    fieldErrors: any = {};
    validationErrors = [];

    constructor(title: Title,
                private parentComponent: VisitorMyAccountComponent,
                private userService: VisitorUserService,
                private authService: AuthService,
                private notify: NotificationService,
                private validationErrorService: ValidationErrorService) {
        title.setTitle('My Profile | Quick Waka');

        this.User = new EditUser();
    }

    ngOnInit() {
        // get logged in user
        this.parentComponent.showLoadingIndicator = true;
        return this.userService.getUserDetails().subscribe(
            // success
            response => {
                this.User = response;
                this.UserId = response.id;

                this.TempPhone = this.User.phoneNumber;
                this.OriginalUser = JSON.stringify(this.User);
                this.parentComponent.showLoadingIndicator = false;
            },

            // error
            error => {
                this.notify.error('Problem retrieving your information, please try reloading page');
                this.parentComponent.showLoadingIndicator = false;
            }
        );
    }


    // Phone operations
    checkPhoneError() {
        if (this.TempPhone !== '') {
            if (this.telInputDirectiveRef.isInputValid()) {
                this.fieldErrors.PhoneNumber = null;
            } else {
                this.fieldErrors.PhoneNumber = 'Enter a valid phone number';
                // this.User.phoneNumber = null;
            }
        } else {
            this.fieldErrors.PhoneNumber = 'Enter a valid phone number';
            // this.User.phoneNumber = null;
        }
    }

    getNumber(obj: string) {
        this.User.phoneNumber = obj;
        if (this.telInputDirectiveRef.isInputValid()) {
            this.fieldErrors.PhoneNumber = null;
        }
    }


    // Changes
    changesMade() {
        /*if (!this.editMode) {
            return false;
        }*/

        const userInfoChanged = this.OriginalUser !== JSON.stringify(this.User);
        /*const pictureRemoved = this.Staff.photoUrl && this.profilePictureComponent && this.profilePictureComponent.pictureRemoved;
        let newPictureSelected = this.profilePictureComponent && this.profilePictureComponent.Picture;
        newPictureSelected = newPictureSelected ?
            (this.Staff.photoUrl && this.Staff.photoUrl !== '' ? this.profilePictureComponent.newPictureSelected : true) : false;*/
        return userInfoChanged; // || pictureRemoved || newPictureSelected;
    }


    save() {
        this.processing = true;
        let process = true;

        const currentUserInfo: EditUser = JSON.parse(JSON.stringify(this.User));
        currentUserInfo.lastName = currentUserInfo.lastName ? currentUserInfo.lastName.trim() : currentUserInfo.lastName;
        currentUserInfo.firstName = currentUserInfo.firstName ? currentUserInfo.firstName.trim() : currentUserInfo.firstName;
        currentUserInfo.phoneNumber = currentUserInfo.phoneNumber ? currentUserInfo.phoneNumber.trim() : currentUserInfo.phoneNumber;
        currentUserInfo.gender = currentUserInfo.gender ? currentUserInfo.gender.trim() : currentUserInfo.gender;

        if (this.OriginalUser === JSON.stringify(currentUserInfo)) {
            process = false;
        }

        if (process) {
            this.fieldErrors = {};
            let error = false;

            if (!this.User.lastName || this.User.lastName.trim() === '') {
                this.fieldErrors.LastName = 'Enter your last name/surname';
                error = true;
            }
            if (!this.User.firstName || this.User.firstName.trim() === '') {
                this.fieldErrors.FirstName = 'Enter your first name';
                error = true;
            }
            if (!this.User.phoneNumber || this.User.phoneNumber.trim() === '') {
                this.fieldErrors.PhoneNumber = 'Enter your phone number';
                error = true;
            } else if (!this.telInputDirectiveRef.isInputValid()) {
                this.fieldErrors.PhoneNumber = 'Enter a valid phone number';
                error = true;
            }
            if (!this.User.gender || this.User.gender.trim() === '') {
                this.fieldErrors.Street = 'Select your gender';
                error = true;
            }

            if (error) {
                this.processing = false;
            } else {
                this.userService.updateUserDetails(this.User).subscribe(

                    // success
                    () => {
                        this.processing = false;
                        this.authService.editUser(this.User);
                        this.OriginalUser = JSON.stringify(this.User);
                        this.notify.success('Your profile was updated successfully!');
                        // this.router.navigate(['/my-account/address-book']);
                    },

                    // error
                    errors => {
                        const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(errors);
                        this.fieldErrors = allErrors.fieldErrors;
                        if (this.fieldErrors.error) {
                            if (this.fieldErrors.error.indexOf('email') !== - 1) {
                                this.fieldErrors.Email = this.fieldErrors.error;
                            }
                            if (this.fieldErrors.error.indexOf('phone') !== - 1) {
                                this.fieldErrors.PhoneNumber = this.fieldErrors.error;
                            }
                        }
                        this.processing = false;
                    }
                );
            }
        } else {
            this.processing = false;
            this.notify.success('Your profile was updated successfully!');
        }
    }

}
