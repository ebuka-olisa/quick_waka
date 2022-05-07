import { ValidationErrorService } from 'src/app/services/validation-error.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ClientViewModel } from 'src/app/models/client';
import { StaffClientsService } from '../staff-clients.service';
import { NotificationService } from 'src/app/services/notification.service';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmActionComponent } from 'src/app/shared/components/confirm-action/confirm-action.component';
import { MyValidationErrors } from 'src/app/models/my-validation-errors';
import { ConfirmDeleteComponent } from 'src/app/shared/components/confirm-delete/confirm-delete.component';

@Component({
    selector: 'app-staff-clients-add',
    templateUrl: './staff-clients-add.component.html',
    styleUrls: ['./staff-clients-add.component.css']
})
export class StaffClientsAddComponent implements OnInit {

    @Output() clientActivated = new EventEmitter<any>();
    @Output() clientDeactivated = new EventEmitter<any>();

    @Input() initialState: any;

    title: string;

    Client: ClientViewModel;
    TempPhone: string;

    fieldErrors: any = {};
    deactivating: boolean;
    activating: boolean;

    editMode: boolean;
    editClientReady = true;

    modalConfig: NgbModalOptions = {
        centered: true,
        keyboard: true,
        backdrop: 'static'
    };

    constructor(private activeModal: NgbActiveModal,
                private modalService: NgbModal,
                private staffClientService: StaffClientsService,
                private notify: NotificationService,
                private validationErrorService: ValidationErrorService) {

        this.Client = new ClientViewModel();
    }

    ngOnInit() {
        // if in edit mode
        if (this.initialState && this.initialState.Client) {
            // clone original object so that changes do not reflect on the list
            this.Client = JSON.parse(JSON.stringify(this.initialState.Client));
            this.editMode = true;
            this.TempPhone = this.Client.phoneNumber;

            // get vendor information from server
            this.getClientForEdit();
        } else {
            this.Client.addresses = [{ id: 0, street: '', city: '', state: '', country: 'Nigeria'}];
        }
    }

    close() {
       this.activeModal.dismiss();
    }


    // Client (Create, Deactivate, Activate)
    getClientForEdit() {
        this.editClientReady = false;

        this.staffClientService.getClient(this.Client)
        .subscribe(
            // success
            response => {
                this.Client = response;

                this.editClientReady = true;
            },

            // error
            error => {
                this.notify.error('Problem loading client information, please reload page.');
                this.editClientReady = false;
                this.activeModal.dismiss();
            }
        );
    }


    // Address methods
    getActiveAddresses() {
        return this.Client.addresses ?
         this.Client.addresses.filter(x => x.deleted === false || x.deleted === null || x.deleted === undefined) : [];
    }


    // Deactivate
    deactivate() {
        const modalRef = this.modalService.open(ConfirmDeleteComponent, this.modalConfig);
        modalRef.componentInstance.ModalContent = {
            item: 'Client',
            action: 'Deactivate'
        };
        modalRef.componentInstance.completeDelete.subscribe(
            () => {
                // close modal
                modalRef.close();

                // delete
                this.completeDeactivate();
            }
        );
    }

    completeDeactivate() {
        this.deactivating = true;
        this.staffClientService.deactivateClient(this.Client)
        .subscribe(

            // success
            (response) => {
                // tell parent component to reload list
                this.clientDeactivated.emit();
                this.deactivating = false;
            },

            // error
            error => {
                const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error, false, true);
                this.fieldErrors = allErrors.fieldErrors;
                this.deactivating = false;
            }
        );
    }


    // Activate
    activate() {
        const modalRef = this.modalService.open(ConfirmActionComponent, this.modalConfig);
        modalRef.componentInstance.ModalContent = {
            item: 'Client',
            action: 'Activate'
        };
        modalRef.componentInstance.completeAction.subscribe(
            () => {
                // close modal
                modalRef.close();

                // delete
                this.completeActivate();
            }
        );
    }

    completeActivate() {
        this.activating = true;
        this.staffClientService.activateClient(this.Client)
        .subscribe(

            // success
            (response) => {
                // tell parent component to reload list
                this.clientActivated.emit();
                this.activating = false;
            },

            // error
            error => {
                const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error, false, true);
                this.fieldErrors = allErrors.fieldErrors;
                this.activating = false;
            }
        );
    }

}
