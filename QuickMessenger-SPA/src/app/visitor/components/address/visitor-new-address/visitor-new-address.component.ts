import { ValidationErrorService } from 'src/app/services/validation-error.service';
import { DeliveryAddress } from './../../../../models/address';
import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedService } from 'src/app/services/shared.service';
import { Ng2TelInput } from 'ng2-tel-input';
import { MyValidationErrors } from 'src/app/models/my-validation-errors';
import { VisitorUserService } from 'src/app/visitor/services/visitor-user.service';

@Component({
    selector: 'app-visitor-new-address',
    templateUrl: './visitor-new-address.component.html',
    styleUrls: ['./visitor-new-address.component.css']
})
export class VisitorNewAddressComponent implements OnInit {

    @Input() initialState: any;
    @Output() addressCreated = new EventEmitter<any>();
    @Output() addressUpdated = new EventEmitter<any>();
    @ViewChild(Ng2TelInput, {static: false}) telInputDirectiveRef: Ng2TelInput;

    User: DeliveryAddress;
    OriginalAddress: string;
    TempPhone: string;

    fieldErrors: any = {};
    validationErrors: any[] = [];
    processing = false;
    editMode = false;
    pickup = false;
    isDefaultDelAdd = false;
    FirstAddress = false;

    States: string[];

    constructor(private activeModal: NgbActiveModal,
                private userService: VisitorUserService,
                private validationErrorService: ValidationErrorService,
                shared: SharedService) {
        this.User = new DeliveryAddress();
        this.User.state = '';
        this.User.country = 'Nigeria';

        this.States = shared.States;
    }

    ngOnInit() {
        if (this.initialState) {
            if (this.initialState.Pickup) {
                this.pickup = this.initialState.Pickup;
            }
            if (this.initialState.SelectedAddress) {
                this.User = JSON.parse(JSON.stringify(this.initialState.SelectedAddress));
                this.editMode = true;
                this.TempPhone = this.User.phone;
                this.isDefaultDelAdd = this.initialState.SelectedAddress.defaultAdd;
                this.OriginalAddress = JSON.stringify(this.User);
            } else if (this.initialState.FirstAddress) {
                this.User.defaultAdd = true;
                this.FirstAddress = true;
            }
        }
    }

    close() {
        this.activeModal.dismiss();
    }



    // Phone operations
    checkPhoneError() {
        if (this.TempPhone !== '') {
            if (this.telInputDirectiveRef.isInputValid()) {
                this.fieldErrors.Phone = null;
            } else {
                this.fieldErrors.Phone = 'Enter a valid phone number';
                // this.User.phone = null;
            }
        } else {
            this.fieldErrors.Phone = 'Enter a valid phone number';
            // this.User.phone = null;
        }
    }

    getNumber(obj: string) {
        this.User.phone = obj;
        if (this.telInputDirectiveRef.isInputValid()) {
            this.fieldErrors.Phone = null;
        }
    }


    save() {
        let process = true;
        if (this.editMode && this.OriginalAddress === JSON.stringify(this.User)) {
            process = false;
        }

        if (process) {
            this.processing = true;
            this.validationErrors = [];
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
            if (!this.User.phone || this.User.phone.trim() === '') {
                this.fieldErrors.Phone = 'Enter your phone number';
                error = true;
            } else if (!this.telInputDirectiveRef.isInputValid()) {
                this.fieldErrors.Phone = 'Enter a valid phone number';
                error = true;
            }
            if (!this.User.street || this.User.street.trim() === '') {
                this.fieldErrors.Street = 'Enter your address';
                error = true;
            }
            if (!this.User.city || this.User.city.trim() === '') {
                this.fieldErrors.City = 'Enter a city';
                error = true;
            }
            if (!this.User.state || this.User.state.trim() === '') {
                this.fieldErrors.State = 'Select a state';
                error = true;
            }

            if (error) {
                this.processing = false;
            } else {
                let result;
                if (this.editMode) {
                    result = this.userService.editAddress(this.User);
                } else {
                    if (this.FirstAddress) {
                        this.User.defaultAdd = true;
                    }
                    result = this.userService.createAddress(this.User);
                }
                result.subscribe(

                    // success
                    () => {
                        this.processing = false;
                        if (this.editMode) {
                            this.addressUpdated.emit(this.User);
                        } else {
                            this.addressCreated.emit();
                        }
                    },

                    // error
                    errors => {
                        const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(errors);
                        this.fieldErrors = allErrors.fieldErrors;
                        this.processing = false;
                    }
                );
            }
        } else {
            if (this.editMode) {
                this.addressUpdated.emit(this.User);
            }
        }
    }

}
