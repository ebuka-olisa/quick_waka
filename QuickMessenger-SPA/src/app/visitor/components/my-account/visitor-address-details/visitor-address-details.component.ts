import { VisitorMyAccountComponent } from './../visitor-my-account/visitor-my-account.component';
import { NotificationService } from './../../../../services/notification.service';
import { ValidationErrorService } from './../../../../services/validation-error.service';
import { VisitorUserService } from './../../../services/visitor-user.service';
import { SharedService } from './../../../../services/shared.service';
import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { DeliveryAddress } from 'src/app/models/address';
import { Ng2TelInput } from 'ng2-tel-input';
import { MyValidationErrors } from 'src/app/models/my-validation-errors';
import { NavigationEnd, Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-visitor-address-details',
  templateUrl: './visitor-address-details.component.html',
  styleUrls: ['./visitor-address-details.component.css']
})
export class VisitorAddressDetailsComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild(Ng2TelInput, {static: false}) telInputDirectiveRef: Ng2TelInput;

    User: DeliveryAddress;
    OriginalAddress: string;
    TempPhone: string;
    States: string[];
    isDefaultDelAdd = false;

    Title: string;

    navigationSubscription;

    fieldErrors: any = {};
    processing = false;
    editMode = false;
    FirstAddress = false;

    constructor(shared: SharedService,
                private router: Router,
                private route: ActivatedRoute,
                private userService: VisitorUserService,
                private notify: NotificationService,
                private title: Title,
                private validationErrorService: ValidationErrorService,
                private parentComponent: VisitorMyAccountComponent) {

        this.User = new DeliveryAddress();

        this.States = shared.States;
    }

    ngOnInit() {
        // get values to route to configure the layout
        this.processRoutingData();
    }

    ngAfterViewInit() {
        this.navigationSubscription = this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.processRoutingData();
            }
        });
    }

    ngOnDestroy() {
        if (this.navigationSubscription) {
          this.navigationSubscription.unsubscribe();
        }
    }


    processRoutingData() {
        this.parentComponent.showLoadingIndicator = true;
        const routeData = this.route.snapshot.data;
        this.editMode = routeData.edit;

        if (this.editMode) {
            this.Title = 'Edit Address';
            this.title.setTitle('Edit Address | Quick Waka');

            // get address by address-id
            this.route.params.subscribe(params => {
                const addId = params['address-id'];
                if (addId) {
                    return this.userService.getAddress(addId).subscribe(
                        // success
                        response => {
                            this.User = response;
                            this.TempPhone = this.User.phone;
                            this.isDefaultDelAdd = this.User.defaultAdd;
                            this.OriginalAddress = JSON.stringify(this.User);
                            this.parentComponent.showLoadingIndicator = false;
                        },

                        // error
                        error => {
                            this.notify.error('Problem retrieving address information, please try reloading page');
                            this.parentComponent.showLoadingIndicator = false;
                        }
                    );
                } else {
                    this.notify.error('Problem retrieving address information, please try reloading page');
                }
            });
        } else {
            this.Title = 'Add New Address';
            this.title.setTitle('Add New Address | Quick Waka');
            this.User.state = '';
            this.User.country = 'Nigeria';

            // get address count
            this.userService.getAddresses().subscribe(
                // success
                response => {
                    this.FirstAddress = !response || response.length === 0;
                    if (this.FirstAddress) {
                        this.User.defaultAdd = true;
                    }

                    this.parentComponent.showLoadingIndicator = false;
                },

                // error
                error => {}
            );
        }
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


    // Changes
    changesMade() {
        /*if (!this.editMode) {
            return false;
        }*/

        const addressChanged = this.OriginalAddress !== JSON.stringify(this.User);
        /*const pictureRemoved = this.Staff.photoUrl && this.profilePictureComponent && this.profilePictureComponent.pictureRemoved;
        let newPictureSelected = this.profilePictureComponent && this.profilePictureComponent.Picture;
        newPictureSelected = newPictureSelected ?
            (this.Staff.photoUrl && this.Staff.photoUrl !== '' ? this.profilePictureComponent.newPictureSelected : true) : false;*/
        return addressChanged; // || pictureRemoved || newPictureSelected;
    }

    save() {
        let process = true;
        this.processing = true;

        const currentUserAddress: DeliveryAddress = JSON.parse(JSON.stringify(this.User));
        currentUserAddress.lastName = currentUserAddress.lastName ? currentUserAddress.lastName.trim() : currentUserAddress.lastName;
        currentUserAddress.firstName = currentUserAddress.firstName ? currentUserAddress.firstName.trim() : currentUserAddress.firstName;
        currentUserAddress.phone = currentUserAddress.phone ? currentUserAddress.phone.trim() : currentUserAddress.phone;
        currentUserAddress.street = currentUserAddress.street ? currentUserAddress.street.trim() : currentUserAddress.street;
        currentUserAddress.city = currentUserAddress.city ? currentUserAddress.city.trim() : currentUserAddress.city;
        currentUserAddress.state = currentUserAddress.state ? currentUserAddress.state.trim() : currentUserAddress.state;

        if (this.editMode && this.OriginalAddress === JSON.stringify(currentUserAddress)) {
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
                            this.notify.success('Address was edited successfully!');
                            this.router.navigate(['/my-account/address-book']);
                        } else {
                            this.notify.success('Address was created successfully!');
                            this.router.navigate(['/my-account/address-book']);
                            // this.router.navigate(['../'], {relativeTo: this.route});
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
            this.processing = false;
            if (this.editMode) {
                this.notify.success('Address was edited successfully!');
                this.router.navigate(['/my-account/address-book']);
            }
        }
    }

}
