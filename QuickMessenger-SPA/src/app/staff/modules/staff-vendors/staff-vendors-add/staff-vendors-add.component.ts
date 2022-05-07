import { VendorViewModel } from './../../../../models/vendor';
import { Component, OnInit, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { SharedService } from 'src/app/services/shared.service';
import { StaffVendorsService } from '../staff-vendors.service';
import { ValidationErrorService } from 'src/app/services/validation-error.service';
import { ProfilePicComponent } from 'src/app/shared/components/profile-pic/profile-pic.component';
import { NgForm } from '@angular/forms';
import { Ng2TelInput } from 'ng2-tel-input';
import { ConfirmExitComponent } from 'src/app/shared/components/confirm-exit/confirm-exit.component';
import { MyValidationErrors } from 'src/app/models/my-validation-errors';
import { ConfirmDeleteComponent } from 'src/app/shared/components/confirm-delete/confirm-delete.component';
import { NotificationService } from 'src/app/services/notification.service';
import { ShowInfoComponent } from 'src/app/shared/components/show-info/show-info.component';

@Component({
    selector: 'app-staff-vendors-add',
    templateUrl: './staff-vendors-add.component.html',
    styleUrls: ['./staff-vendors-add.component.css']
})
export class StaffVendorsAddComponent implements OnInit {

    // View Child is available after view intialization (AfterViewInit)
    @ViewChild(ProfilePicComponent, {static: false})
    private profilePictureComponent: ProfilePicComponent;

    @ViewChild('myForm', {static: false}) private myForm: NgForm;

    @ViewChild('phone', {read: Ng2TelInput, static: false}) telInputDirectiveRef1: Ng2TelInput;
    @ViewChild('phone2', {read: Ng2TelInput, static: false}) telInputDirectiveRef2: Ng2TelInput;
    // @ViewChildren(Ng2TelInput) telInputDirectiveRef: QueryList<Ng2TelInput>;

    @Output() vendorCreated = new EventEmitter<any>();
    @Output() vendorEdited = new EventEmitter<any>();
    @Output() vendorDeleted = new EventEmitter<any>();

    @Input() initialState: any;

    Vendor: VendorViewModel;
    OriginalVendor: string;
    States: string[];
    fieldErrors: any = {};
    processing: boolean;
    deleting: boolean;

    editMode: boolean;
    editVendorReady = true;

    TempPhone: string;
    TempPhone2: string;
    ng2TelInputOptions = {
        initialCountry: 'ng',
        utilsScript: 'node_modules/intl-tel-input/build/js/utils.js',
        preferredCountries: ['ng', 'us', 'gb']
    };

    profilePictureConfig: any;

    modalConfig: NgbModalOptions = {
        centered: true,
        keyboard: true,
        backdrop: 'static'
    };

    descriptionTextAreaReady = false;
    descriptionTextAreaConfig: any = {
        min_height: 200,
        max_height: 500,
        theme: 'modern',
        statusbar: false,
        menubar: false,
        toolbar_drawer: 'floating',
        plugins: 'autoresize fullscreen autolink image imagetools link codesample lists textcolor colorpicker',
        toolbar: 'bold italic underline strikethrough | forecolor formatselect | numlist bullist | outdent indent |'
            + ' link removeformat fullscreen',
        setup(editor) {
            editor.on('focus', (e) => {
                jQuery(editor.getContainer()).addClass('focus');
            });
            editor.on('blur', (e) => {
                jQuery(editor.getContainer()).removeClass('focus');
            });
        }
    };


    constructor(private activeModal: NgbActiveModal,
                private modalService: NgbModal,
                shared: SharedService,
                private staffVendorService: StaffVendorsService,
                private validationErrorService: ValidationErrorService,
                private notify: NotificationService) {

        this.Vendor = new VendorViewModel();

        this.States = shared.States;
    }

    ngOnInit() {
        // if in edit mode
        if (this.initialState && this.initialState.Vendor) {
            // clone original object so that changes do not reflect on the list
            this.Vendor = JSON.parse(JSON.stringify(this.initialState.Vendor));
            this.editMode = true;

            // get vendor information from server
            this.getVendorForEdit();
        } else {
            this.Vendor.address = { id: 0, street: '', city: '', state: '', country: 'Nigeria'};
            this.completeVendorSetup();
        }
    }

    close() {
        // !this.myForm.dirty &&
        if (!this.changesMade()) {
            this.activeModal.dismiss();
        } else {
            // show another modal asking to discard changes
            const modalRef = this.modalService.open(ConfirmExitComponent, this.modalConfig);
            modalRef.componentInstance.closeEditModal.subscribe(
                () => {
                    modalRef.close();
                    this.activeModal.dismiss();
                }
            );
        }
    }

    // Phone operations
    checkPhoneError() {
        if (this.TempPhone !== '') {
            if (this.telInputDirectiveRef1.isInputValid()) {
                this.fieldErrors.Phone = null;
            } else {
                this.fieldErrors.Phone = 'Enter a valid phone number';
            }
        } else {
            this.fieldErrors.Phone = null;
        }
    }

    checkPhoneError2() {
        if (this.TempPhone2 !== '') {
            if (this.telInputDirectiveRef2.isInputValid()) {
                this.fieldErrors.Phone2 = null;
            } else {
                this.fieldErrors.Phone2 = 'Enter a valid phone number';
            }
        } else {
            this.fieldErrors.Phone2 = null;
        }
    }

    getNumber(obj: string) {
        this.Vendor.phone = obj;
        if (this.telInputDirectiveRef1.isInputValid()) {
            this.fieldErrors.Phone = null;
        }
    }

    getNumber2(obj: string) {
        this.Vendor.phone2 = obj;
        if (this.telInputDirectiveRef2.isInputValid()) {
            this.fieldErrors.Phone2 = null;
        }
    }

    phone2Invalid() {
        const notValid = this.TempPhone2 !== undefined && this.TempPhone2 !== null && this.TempPhone2 !== ''
            && !this.telInputDirectiveRef2.isInputValid();
        return notValid;
    }


    // Description Operations
    descriptionReady() {
        this.descriptionTextAreaReady = true;
    }


    // Changes
    changesMade() {
        /*if (!this.editMode) {
            return false;
        }*/

        const vendorInfoChanged = this.OriginalVendor !== JSON.stringify(this.Vendor);
        const pictureRemoved = this.Vendor.logo && this.Vendor.logo && this.Vendor.logo.url
            && this.profilePictureComponent && this.profilePictureComponent.pictureRemoved;
        let newPictureSelected = this.profilePictureComponent && this.profilePictureComponent.Picture;
        newPictureSelected = newPictureSelected ?
            (this.Vendor.logo && this.Vendor.logo.url && this.Vendor.logo.url !== ''
                ? this.profilePictureComponent && this.profilePictureComponent.newPictureSelected : true) : false;
        return vendorInfoChanged || pictureRemoved || newPictureSelected;
    }


    // Vendor (Create, Edit & Delete)
    getVendorForEdit() {
        this.editVendorReady = false;

        this.staffVendorService.getVendor(this.Vendor)
        .subscribe(
            // success
            response => {
                this.Vendor = response;
                this.TempPhone = this.Vendor.phone;
                this.TempPhone2 = this.Vendor.phone2;

                this.completeVendorSetup();

                this.editVendorReady = true;
            },

            // error
            error => {
                this.notify.error('Problem loading vendor information, please reload page.');
                this.editVendorReady = false;
                this.activeModal.dismiss();
            }
        );
    }

    completeVendorSetup() {
        // get copy of vendor to determine if change has been made
        this.OriginalVendor = JSON.stringify(this.Vendor);

        // set parameters for profile picture component
        this.profilePictureConfig = {
            cssClass: 'centered',
            pictureText: 'logo',
            photoUrl: this.editMode && this.Vendor.logo && this.Vendor.logo.url
                && this.Vendor.logo.url !== '' ? this.Vendor.logo.url : null
        };
    }

    save() {
        this.processing = true;
        this.fieldErrors = {};

        // create new object to contain vendor information
        const vendorObj: VendorViewModel = JSON.parse(JSON.stringify(this.Vendor));

        // configure address
        this.configureAddress(vendorObj);

        if (!this.editMode) {
            this.createNewVendor(vendorObj);
        } else {
            this.editVendor(vendorObj);
        }
    }

    configureAddress(vendorObj: VendorViewModel) {
        if ((vendorObj.address.street === undefined || vendorObj.address.street.trim() === '')
            && (vendorObj.address.city === undefined || vendorObj.address.city.trim() === '')
            && (vendorObj.address.state === undefined || vendorObj.address.state.trim() === '')) {
                delete vendorObj.address;
            }
    }

    createNewVendor(vendorObj: VendorViewModel) {
        this.staffVendorService.createVendor(vendorObj)
        .subscribe(

            // success
            (response) => {
                if (this.profilePictureComponent.Picture === null) {
                    // tell parent component to reload staff list
                    this.vendorCreated.emit();
                    this.processing = false;
                    this.reloadVendorListUsedByOthers();
                } else {
                    this.uploadVendorPhoto(response.id, false);
                }
            },

            // error
            error => {
                const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error);
                this.fieldErrors = allErrors.fieldErrors;
                if (this.fieldErrors.error && this.fieldErrors.error.indexOf('name') !== - 1) {
                    this.fieldErrors.Name = this.fieldErrors.error;
                }
                this.processing = false;
            }
        );
    }

    editVendor(vendorObj: VendorViewModel) {
        // check if a new picture was selected
        let newPictureSelected = this.profilePictureComponent.Picture !== null;
        newPictureSelected = newPictureSelected ?
            (this.Vendor.logo && this.Vendor.logo.url && this.Vendor.logo.url !== '' ?
                this.profilePictureComponent.newPictureSelected : true) : false;

        // check if logo was deleted
        if (this.Vendor.logo !== undefined && this.Vendor.logo !== null && this.Vendor.logo.url !== null
            && this.profilePictureComponent.pictureRemoved) {
                vendorObj.logo.deleted = true;
        }

        // if changes were made to staff information then update staff
        if (this.OriginalVendor !== JSON.stringify(vendorObj)) {
            const myVendor = vendorObj;

            this.staffVendorService.editVendor(myVendor)
            .subscribe(

                // success
                () => {

                    if (newPictureSelected) {
                        this.uploadVendorPhoto(myVendor.id, true);
                    } else {
                        // tell parent component to reload staff list
                        this.vendorEdited.emit();
                        this.processing = false;
                        this.reloadVendorListUsedByOthers();
                    }
                },

                // error
                error => {
                    const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error);
                    this.fieldErrors = allErrors.fieldErrors;
                    if (this.fieldErrors.error && this.fieldErrors.error.indexOf('name') !== - 1) {
                        this.fieldErrors.Name = this.fieldErrors.error;
                    }
                    this.processing = false;
                }
            );
        } else if (newPictureSelected) { // if picture was just changed
            this.uploadVendorPhoto(vendorObj.id, true);
        }
    }

    delete() {
        // show remove modal if category can de deleted
        if (this.Vendor.canDelete === undefined || this.Vendor.canDelete === true) {
            const modalRef = this.modalService.open(ConfirmDeleteComponent, this.modalConfig);
            modalRef.componentInstance.ModalContent = {
                item: 'Vendor',
            };
            modalRef.componentInstance.completeDelete.subscribe(
                () => {
                    // close modal
                    modalRef.close();

                    // delete
                    this.completeDelete();
                }
            );
        } else {
            // tell user that this item cannot be removed
            const modalRef = this.modalService.open(ShowInfoComponent, this.modalConfig);
            modalRef.componentInstance.ModalContent = {
                title: 'Vendor In Use',
                message: 'This vendor cannot be deleted because it contains products',
                icon: 'warning'
            };
        }
    }

    completeDelete() {
        this.deleting = true;
        this.staffVendorService.deleteVendor(this.Vendor.id)
        .subscribe(

            // success
            (response) => {
                // tell parent component to reload staff list
                this.vendorDeleted.emit();
                this.deleting = false;
                this.reloadVendorListUsedByOthers();
            },

            // error
            error => {
                const allErrors: MyValidationErrors = this.validationErrorService
                .showValidationErrors(error, true);
                this.fieldErrors = allErrors.fieldErrors;
                this.deleting = false;
            }
        );
    }


    // Picture Upload & Delete
    uploadVendorPhoto(vendorId: number, update) {
        this.staffVendorService.uploadVendorPhoto(vendorId, this.profilePictureComponent.Picture)
        .subscribe(

            // success
            () => {
                // tell parent component to reload staff list
                if (!update) {
                    this.vendorCreated.emit();
                } else {
                    this.vendorEdited.emit();
                }
                this.processing = false;
                this.reloadVendorListUsedByOthers();
            },

            // error
            error => {
                const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error);
                this.fieldErrors = allErrors.fieldErrors;
                this.processing = false;
            }
        );
    }

    reloadVendorListUsedByOthers() {
        /*if (this.staffProductsService.ProductVendorsList) {
            this.staffProductsService.getVendorsList()
            .subscribe(
                // success
                response => {
                    this.staffProductsService.ProductVendorsList = response;
                },

                // error
                error => {}
            );
        }*/
    }

}
