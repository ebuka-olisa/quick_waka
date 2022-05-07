import { SharedService } from 'src/app/services/shared.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { StaffViewModel } from 'src/app/models/staff';
import { Ng2TelInput } from 'ng2-tel-input';
import { NgForm } from '@angular/forms';
import { StaffProfileLayoutComponent } from '../staff-profile-layout/staff-profile-layout.component';
import { StaffProfileService } from '../staff-profile.service';
import { ValidationErrorService } from 'src/app/services/validation-error.service';
import { MyValidationErrors } from 'src/app/models/my-validation-errors';

@Component({
    selector: 'app-staff-profile-contact-edit',
    templateUrl: './staff-profile-contact-edit.component.html',
    styleUrls: ['./staff-profile-contact-edit.component.css']
})
export class StaffProfileContactEditComponent implements OnInit {
    User: StaffViewModel;
    OriginalUser: string;

    @ViewChild('myForm', {static: false}) private myForm: NgForm;
    fieldErrors: any = {};
    processing = false;

    TempPhone: string;
    @ViewChild(Ng2TelInput, {static: false}) telInputDirectiveRef: Ng2TelInput;

    States: string[];

    constructor(private parentComponent: StaffProfileLayoutComponent,
                private staffProfileService: StaffProfileService,
                private validationErrorService: ValidationErrorService,
                shared: SharedService) {

        this.States = shared.States;
    }

    ngOnInit() {
        if (this.parentComponent.User) {
            this.User = JSON.parse(JSON.stringify(this.parentComponent.User));
            this.OriginalUser = JSON.stringify(this.User);
            this.TempPhone = this.User.phone;
        }
    }


    // Changes
    changesMade() {
        const userInfoChanged = this.OriginalUser !== JSON.stringify(this.User);
        return userInfoChanged;
    }


    // Phone operations
    checkPhoneError() {
        if (this.TempPhone !== '') {
            if (this.telInputDirectiveRef.isInputValid()) {
                this.fieldErrors.Phone = null;
            } else {
                this.fieldErrors.Phone = 'Enter a valid phone number';
            }
        } else {
            this.fieldErrors.Phone = null;
        }
    }

    getNumber(obj: string) {
        this.User.phone = obj;
        if (this.telInputDirectiveRef.isInputValid()) {
            this.fieldErrors.Phone = null;
        }
    }


    // Address Methods
    addNewAddress() {
        this.User.addresses.push({ id: 0, street: '', city: '', state: '', country: 'Nigeria'});
    }

    removeAddress(index: number) {
        const addr = this.User.addresses[index];
        if (addr.id !== 0) {
            addr.deleted = true;
        } else {
            this.User.addresses.splice(index, 1);
        }
    }

    getActiveAddresses() {
        return this.User.addresses.filter(x => x.deleted === false || x.deleted === null || x.deleted === undefined);
    }

    trackAddressByIndex(index: number, obj: any): any {
        return index;
    }


    // Save
    save() {
        this.processing = true;
        this.fieldErrors = {};

        // create new object to contain staff information
        const originalUserObj: StaffViewModel = JSON.parse(JSON.stringify(this.parentComponent.User));
        const editedUserObj: StaffViewModel = JSON.parse(JSON.stringify(this.User));

        // make allowed changes
        originalUserObj.email = editedUserObj.email;
        originalUserObj.userName = editedUserObj.email;
        originalUserObj.phone = editedUserObj.phone;

        // configure address
        originalUserObj.addresses = this.configureAddresses(editedUserObj);

        // if changes were made to staff information then update staff
        if (this.OriginalUser !== JSON.stringify(originalUserObj)) {
            this.staffProfileService.editProfile(originalUserObj)
            .subscribe(

                // success
                (response) => {
                    // tell parent component to reload profile information
                    this.parentComponent.updateProfile(originalUserObj, response);

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

    configureAddresses(userObj: StaffViewModel) {
        const addresses = userObj.addresses;
        for (let index = addresses.length - 1; index >= 0; index --) {
            const add = addresses[index];
            if ((add.street === undefined || add.street.trim() === '') && (add.city === undefined || add.city.trim() === '') &&
                (add.state === undefined || add.state.trim() === '')) {
                addresses.splice(index, 1);
            }
        }
        return addresses;
    }

    reset() {
        this.User.email = this.parentComponent.User.email;
        this.User.phone = this.parentComponent.User.phone;
        this.User.addresses = this.parentComponent.User.addresses;
    }
}
