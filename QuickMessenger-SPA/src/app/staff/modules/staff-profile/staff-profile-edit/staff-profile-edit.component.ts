import { ValidationErrorService } from './../../../../services/validation-error.service';
import { StaffProfileService } from './../staff-profile.service';
import { StaffViewModel } from 'src/app/models/staff';
import { StaffProfileLayoutComponent } from './../staff-profile-layout/staff-profile-layout.component';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Ng2TelInput } from 'ng2-tel-input';
import { NgForm } from '@angular/forms';
import { ProfilePicComponent } from 'src/app/shared/components/profile-pic/profile-pic.component';
import { MyValidationErrors } from 'src/app/models/my-validation-errors';

@Component({
  selector: 'app-staff-profile-edit',
  templateUrl: './staff-profile-edit.component.html',
  styleUrls: ['./staff-profile-edit.component.css']
})
export class StaffProfileEditComponent implements OnInit {

    User: StaffViewModel;
    OriginalUser: string;

    @ViewChild(ProfilePicComponent, {static: false})
    private profilePictureComponent: ProfilePicComponent;

    @ViewChild('myForm', {static: false}) private myForm: NgForm;
    fieldErrors: any = {};
    processing = false;

    profilePictureConfig: any;

    constructor(private parentComponent: StaffProfileLayoutComponent,
                private staffProfileService: StaffProfileService,
                private validationErrorService: ValidationErrorService) {}

    ngOnInit() {
        if (this.parentComponent.User) {
            this.User = JSON.parse(JSON.stringify(this.parentComponent.User));
            this.OriginalUser = JSON.stringify(this.User);

            // set parameters for profile picture component
            this.profilePictureConfig = {
                cssClass: 'centered',
                photoUrl: this.User.photoUrl && this.User.photoUrl !== '' ? this.User.photoUrl : null
            };
        }
    }


    // Changes
    changesMade() {
        const userInfoChanged = this.OriginalUser !== JSON.stringify(this.User);
        const pictureRemoved = this.User.photoUrl !== null && this.profilePictureComponent && this.profilePictureComponent.pictureRemoved;
        let newPictureSelected = this.profilePictureComponent && this.profilePictureComponent.Picture !== null;
        newPictureSelected = newPictureSelected ?
            (this.User.photoUrl && this.User.photoUrl !== '' ? this.profilePictureComponent.newPictureSelected : true) : false;
        return userInfoChanged || pictureRemoved || newPictureSelected;
    }


    // Save
    save() {
        this.processing = true;
        this.fieldErrors = {};

        // create new object to contain staff information
        const originalUserObj: StaffViewModel = JSON.parse(JSON.stringify(this.parentComponent.User));
        const editedUserObj: StaffViewModel = JSON.parse(JSON.stringify(this.User));

        // make allowed changes
        originalUserObj.lastName = editedUserObj.lastName;
        originalUserObj.firstName = editedUserObj.firstName;
        originalUserObj.gender = editedUserObj.gender;

        // check if a new picture was selected
        let newPictureSelected = this.profilePictureComponent.Picture !== null;
        newPictureSelected = newPictureSelected ?
            (this.User.photoUrl && this.User.photoUrl !== '' ? this.profilePictureComponent.newPictureSelected : true) : false;

        // if changes were made to staff information then update staff
        if (this.OriginalUser !== JSON.stringify(originalUserObj)) {
            originalUserObj.removePhoto = this.User.photoUrl !== null && this.User.photoUrl !== '' ?
                this.profilePictureComponent.pictureRemoved : false;

            this.staffProfileService.editProfile(originalUserObj)
            .subscribe(

                // success
                (response) => {
                    if (newPictureSelected) {
                        this.uploadUserPhoto(originalUserObj);
                    } else {
                        // tell parent component to reload profile information
                        this.parentComponent.updateProfile(originalUserObj, response ? response : null);

                        // reload reference point
                        this.User = JSON.parse(JSON.stringify(this.parentComponent.User));
                        this.OriginalUser = JSON.stringify(this.User);

                        // stop loading icon
                        this.processing = false;
                    }
                },

                // error
                error => {
                    const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error);
                    this.fieldErrors = allErrors.fieldErrors;
                    this.processing = false;
                }
            );
        } else if (newPictureSelected) { // if picture was just changed
            this.uploadUserPhoto(originalUserObj);
        } else if (this.User.photoUrl !== null && this.profilePictureComponent.pictureRemoved) { // if picture was just removed
            this.deleteUserPhoto(originalUserObj);
        }
    }

    reset() {
        this.User.lastName = this.parentComponent.User.lastName;
        this.User.firstName = this.parentComponent.User.firstName;
        this.User.gender = this.parentComponent.User.gender;

        this.profilePictureConfig = {
            cssClass: 'centered',
            photoUrl: this.User.photoUrl && this.User.photoUrl !== '' ? this.User.photoUrl : null
        };
    }


    // Picture Upload & Delete
    uploadUserPhoto(userObj: StaffViewModel) {
        this.staffProfileService.uploadUserPhoto(userObj.id, this.profilePictureComponent.Picture)
        .subscribe(

            // success
            (response) => {
                // tell parent component to reload staff list
                userObj.photoUrl = response.response1.url;
                this.parentComponent.updateProfile(userObj, response.response2);

                // reload reference point
                this.User = JSON.parse(JSON.stringify(this.parentComponent.User));
                this.OriginalUser = JSON.stringify(this.User);

                this.processing = false;
            },

            // error
            error => {
                const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error);
                this.fieldErrors = allErrors.fieldErrors;
                this.processing = false;
            }
        );
    }

    deleteUserPhoto(userObj: StaffViewModel) {
        this.staffProfileService.deleteUserPhoto(userObj.id)
        .subscribe(

            // success
            (response) => {
                // tell parent component to reload staff list
                userObj.photoUrl = null;
                this.parentComponent.updateProfile(userObj, response);

                // reload reference point
                this.User = JSON.parse(JSON.stringify(this.parentComponent.User));
                this.OriginalUser = JSON.stringify(this.User);

                this.processing = false;
            },

            // error
            error => {
                const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error);
                this.fieldErrors = allErrors.fieldErrors;
                this.processing = false;
            }
        );
    }

}
