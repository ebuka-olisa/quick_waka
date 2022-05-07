import { Ng2TelInput } from 'ng2-tel-input';
import { ConfirmExitComponent } from './../../../../shared/components/confirm-exit/confirm-exit.component';
import { ValidationErrorService } from './../../../../services/validation-error.service';
import { StaffStaffService } from './../staff-staff.service';
import { ProfilePicComponent } from './../../../../shared/components/profile-pic/profile-pic.component';
import { Component, OnInit, ViewChild, EventEmitter, Output, Input } from '@angular/core';
import { StaffViewModel } from 'src/app/models/staff';
import { SharedService } from 'src/app/services/shared.service';
import { MyValidationErrors } from 'src/app/models/my-validation-errors';
import { NgForm } from '@angular/forms';
import { NgbActiveModal, NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmDeleteComponent } from 'src/app/shared/components/confirm-delete/confirm-delete.component';
import { StatusOption } from 'src/app/models/product';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-staff-staff-add',
  templateUrl: './staff-staff-add.component.html',
  styleUrls: ['./staff-staff-add.component.css']
})
export class StaffStaffAddComponent implements OnInit {

    @ViewChild(ProfilePicComponent, {static: false})
    private profilePictureComponent: ProfilePicComponent;

    @ViewChild('myForm', {static: false}) private myForm: NgForm;

    @ViewChild(Ng2TelInput, {static: false}) telInputDirectiveRef: Ng2TelInput;

    @Output() staffCreated = new EventEmitter<any>();
    @Output() staffEdited = new EventEmitter<any>();
    @Output() staffDeleted = new EventEmitter<any>();

    @Input() initialState: any;

    title: string;

    Staff: StaffViewModel;
    OriginalStaff: string;
    TempPhone: string;
    States: string[];
    fieldErrors: any = {};
    processing: boolean;
    deleting: boolean;
    editMode: boolean;

    editStaffReady = true;

    profilePictureConfig: any;

    modalConfig: NgbModalOptions = {
        centered: true,
        keyboard: true,
        backdrop: 'static'
    };

    StatusOptions: StatusOption[] = [];
    statusSelectizeConfig = {
        labelField: 'name',
        valueField: 'value',
        searchField: 'name',
        maxItems: 1,
        highlight: false,
        create: false,
        closeAfterSelect: true,
        render: {
            item(item, escape) { // selection
                const buildString = '<div><span class="font-14"><span class="dot ' + escape(item.iconClass) + '"></span>'
                    + escape(item.name) + '</span></div>';
                return buildString;
            },
            option(item, escape) {
                const buildString = '<div><span class="font-14"><span class="dot ' + escape(item.iconClass) + '"></span>'
                    + escape(item.name) + '</span></div>';
                return buildString;
            }
        },
        // dropdownParent: 'body',
        // placeholder: 'Select Parent Category'
        // items: [] -> initial selected values
    };

    constructor(private activeModal: NgbActiveModal,
                private modalService: NgbModal,
                shared: SharedService,
                private staffService: StaffStaffService,
                private validationErrorService: ValidationErrorService,
                private notify: NotificationService) {

        this.Staff = new StaffViewModel();

        this.States = shared.States;
        this.StatusOptions = shared.StatusOptions;
    }

    ngOnInit() {
        // if in edit mode
        if (this.initialState && this.initialState.Staff) {

            // clone original object so that changes do not reflect on the list
            this.Staff = JSON.parse(JSON.stringify(this.initialState.Staff));
            this.editMode = true;

            // get staff information from server
            this.getStaffForEdit();
        } else {
            // set default values
            this.Staff.deactivated = 'false';
            this.Staff.gender = 'female';
            this.Staff.role = 'Admin';
            this.completeStaffSetup();
        }
    }

    /*ngAfterViewChecked() {
        if (this.editMode) {
            if (!this.telInputDirectiveRef.isInputValid()) {
                this.fieldErrors.Phone = 'Enter a valid phone number';
            }
        }
    }*/

    close() {
        if (!this.changesMade()) {
            this.activeModal.dismiss();
        } else {
            // show another modal asking to discard changes
            const modalRef = this.modalService.open(ConfirmExitComponent, this.modalConfig);
            modalRef.componentInstance.closeEditModal.subscribe(
                () => {
                modalRef.close();
                this.activeModal.close();
                }
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
            }
        } else {
            this.fieldErrors.Phone = null;
        }
    }

    getNumber(obj: string) {
        this.Staff.phone = obj;
        if (this.telInputDirectiveRef.isInputValid()) {
            this.fieldErrors.Phone = null;
        }
    }


    // Address Methods
    addNewAddress() {
        this.Staff.addresses.push({ id: 0, street: '', city: '', state: '', country: 'Nigeria'});
    }

    removeAddress(index: number) {
        const addr = this.Staff.addresses[index];
        if (addr.id !== 0) {
            addr.deleted = true;
        } else {
            this.Staff.addresses.splice(index, 1);
        }
    }

    getActiveAddresses() {
        return this.Staff.addresses.filter(x => x.deleted === false || x.deleted === null || x.deleted === undefined);
    }

    trackAddressByIndex(index: number, obj: any): any {
        return index;
    }


    // Staff (Get, Create, Edit & Delete)
    getStaffForEdit() {
        this.editStaffReady = false;

        this.staffService.getStaff(this.Staff)
        .subscribe(
            // success
            response => {
                this.Staff = response;

                this.Staff.deactivated = this.Staff.deactivated ? 'true' : 'false';
                if (this.Staff.addresses.length === 0) {
                    this.Staff.addresses = [{ id: 0, street: '', city: '', state: '', country: 'Nigeria'}];
                }
                this.TempPhone = this.Staff.phone;

                this.completeStaffSetup();

                this.editStaffReady = true;
            },

            // error
            error => {
                this.notify.error('Problem loading staff information, please reload page.');
                this.editStaffReady = false;
                this.activeModal.dismiss();
            }
        );
    }

    completeStaffSetup() {
        // get copy of staff to determine if change has been made
        this.OriginalStaff = JSON.stringify(this.Staff);

        // set parameters for profile picture component
        this.profilePictureConfig = {
            cssClass: 'centered',
            photoUrl: this.editMode && this.Staff.photoUrl && this.Staff.photoUrl !== '' ? this.Staff.photoUrl : null
        };
    }

    save() {
        this.processing = true;
        this.fieldErrors = {};

        // create new object to contain staff information
        const staffObj: StaffViewModel = JSON.parse(JSON.stringify(this.Staff));

        // configure address
        this.configureAddresses(staffObj);

        // configure deactivation status
        if (staffObj.deactivated === 'false') {
            staffObj.deactivated = false;
        } else {
            staffObj.deactivated = true;
        }

        if (!this.editMode) {
            staffObj.deactivated = false;
            this.createNewStaff(staffObj);
        } else {
            this.editStaff(staffObj);
        }
    }

    configureAddresses(staffObj: StaffViewModel) {
        for (let index = staffObj.addresses.length - 1; index >= 0; index --) {
            const add = staffObj.addresses[index];
            if ((add.street === undefined || add.street.trim() === '') && (add.city === undefined || add.city.trim() === '') &&
                (add.state === undefined || add.state.trim() === '')) {
                staffObj.addresses.splice(index, 1);
            }
        }
    }

    createNewStaff(staffObj: StaffViewModel) {
        this.staffService.createStaff(staffObj)
        .subscribe(

            // success
            (response) => {
                if (this.profilePictureComponent.Picture === null) {
                    // tell parent component to reload staff list
                    this.staffCreated.emit();
                    this.processing = false;
                    this.reloadRidersListUsedByOthers(staffObj);
                } else {
                    this.uploadStaffPhoto(response.id, false);
                }
            },

            // error
            error => {
                const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error);
                this.fieldErrors = allErrors.fieldErrors;
                if (this.fieldErrors.DuplicateUserName) {
                    this.fieldErrors.Email = 'This email address is already taken';
                }
                this.processing = false;
            }
        );
    }

    editStaff(staffObj: StaffViewModel) {

        // check if a new picture was selected
        let newPictureSelected = this.profilePictureComponent.Picture !== null;
        newPictureSelected = newPictureSelected ?
            (this.Staff.photoUrl && this.Staff.photoUrl !== '' ? this.profilePictureComponent.newPictureSelected : true) : false;

        // if changes were made to staff information then update staff
        if (this.OriginalStaff !== JSON.stringify(this.Staff)) {
            const myStaff = staffObj;
            myStaff.removePhoto = this.Staff.photoUrl !== null && this.Staff.photoUrl !== '' ? this.profilePictureComponent.pictureRemoved
                : false;

            this.staffService.editStaff(myStaff)
            .subscribe(

                // success
                () => {

                    if (newPictureSelected) {
                        this.uploadStaffPhoto(myStaff.id, true);
                    } else {
                        // tell parent component to reload staff list
                        this.staffEdited.emit();
                        this.processing = false;
                        this.reloadRidersListUsedByOthers(myStaff);
                    }
                },

                // error
                error => {
                    const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error);
                    this.fieldErrors = allErrors.fieldErrors;
                    if (this.fieldErrors.DuplicateUserName) {
                        this.fieldErrors.Email = 'This email address is already taken';
                    }
                    this.processing = false;
                }
            );
        } else if (newPictureSelected) { // if picture was just changed
            this.uploadStaffPhoto(staffObj.id, true);
        } else if (this.Staff.photoUrl !== null && this.profilePictureComponent.pictureRemoved) { // if picture was just removed
            this.deleteStaffPhoto(staffObj.id);
        }
    }

    delete() {
        // show another modal asking to delete or not
        const modalRef = this.modalService.open(ConfirmDeleteComponent, this.modalConfig);
        modalRef.componentInstance.ModalContent = {
            item: 'staff'
        };
        modalRef.componentInstance.completeDelete.subscribe(
            () => {
                modalRef.close();
                this.completeDelete();
            }
        );
    }

    completeDelete() {
        this.deleting = true;
        this.staffService.deleteStaff(this.Staff.id)
        .subscribe(

            // success
            (response) => {
                // tell parent component to reload staff list
                this.staffDeleted.emit();
                this.deleting = false;
                this.reloadRidersListUsedByOthers(this.Staff);
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
    uploadStaffPhoto(staffId: number, update) {
        this.staffService.uploadStaffPhoto(staffId, this.profilePictureComponent.Picture)
        .subscribe(

            // success
            () => {
                // tell parent component to reload staff list
                if (!update) {
                    this.staffCreated.emit();
                } else {
                    this.staffEdited.emit();
                }
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

    deleteStaffPhoto(staffId: number) {
        this.staffService.deleteStaffPhoto(staffId)
        .subscribe(

            // success
            () => {
                // tell parent component to reload staff list
                this.staffEdited.emit();
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

    reloadRidersListUsedByOthers(staff: StaffViewModel) {
        /*if (this.staffOrdersService.OrderRidersList && staff.role == 'Rider') {
            this.staffOrdersService.getRidersList()
            .subscribe(
                // success
                response => {
                    this.staffOrdersService.OrderRidersList = response;
                },

                // error
                error => {}
            );
        }*/
    }


    // Changes
    changesMade() {
        /*if (!this.editMode) {
            return false;
        }*/

        const staffInfoChanged = this.OriginalStaff !== JSON.stringify(this.Staff);
        const pictureRemoved = this.Staff.photoUrl && this.profilePictureComponent && this.profilePictureComponent.pictureRemoved;
        let newPictureSelected = this.profilePictureComponent && this.profilePictureComponent.Picture;
        newPictureSelected = newPictureSelected ?
            (this.Staff.photoUrl && this.Staff.photoUrl !== '' ? this.profilePictureComponent.newPictureSelected : true) : false;
        return staffInfoChanged || pictureRemoved || newPictureSelected;
    }

}
